import { HttpClient } from '@angular/common/http';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
    OnInit,
    AfterViewInit,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TREE_ACTIONS, TreeComponent, TreeModel, TreeNode } from 'angular-tree-component';

import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { convertFormToSection } from 'core/form/form';
import _isEmpty from 'lodash/isEmpty';
import _noop from 'lodash/noop';
import { DeCompletionService } from 'cde/public/components/completion/deCompletion.service';
import { copySectionAnimation } from 'form/public/tabs/description/copySectionAnimation';
import { FormService } from 'nativeRender/form.service';
import { Cb } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm, FormElement, FormInForm, FormOrElement, FormSection } from 'shared/form/form.model';
import { addFormIds, iterateFeSync } from 'shared/form/fe';
import { scrollTo, waitRendered } from 'non-core/browser';
import { LocalStorageService } from 'non-core/localStorage.service';

@Component({
    selector: 'cde-form-description',
    templateUrl: 'formDescription.component.html',
    animations: [copySectionAnimation],
    providers: [DeCompletionService],
    styles: [`
        :host ::ng-deep .hover-bg {
            background-color: lightblue;
            border: 1px;
            border-radius: 10px;
        }
        :host ::ng-deep .badge {
            font-size: 100%;
        }
        :host ::ng-deep .panel {
            margin-bottom: 1px;
        }
        :host ::ng-deep .tree-children {
            padding-left: 0;
        }
        :host ::ng-deep .dragActive {
            background-color: lightblue;
        }
        :host ::ng-deep .panel-badge-btn {
            color: white;
            background-color: #333;
        }
        :host ::ng-deep .badge.formViewSummaryLabel {
            display: inline-flex;
            margin-left: 4px;
            margin-top: 2px;
            white-space: normal;
        }
        :host ::ng-deep .node-content-wrapper:hover {
            background: transparent;
            box-shadow: inset 0 0 0;
        }
        :host ::ng-deep .is-dragging-over-disabled {
            border: 1px dashed;
            border-radius: 4px;
            background: lightpink !important;
        }
        :host ::ng-deep .is-dragging-over {
            border: 1px dashed;
            border-radius: 4px;
            background-color: lightgreen !important;
        }
        :host ::ng-deep .node-drop-slot {
            height: 20px;
            margin-bottom: 10px;
        }
        :host ::ng-deep .drag-active .node-drop-slot:not(.is-dragging-over) {
            background-color: lightblue;
        }
        .panel-body-form,
        .panel-body-form ::ng-deep .card-body {
            background-color: rgba(0, 0, 0, 0.03);
        }
        .descriptionToolbox {
            color: #9d9d9d;
            background-color: #343a40;
            position: fixed;
            padding: 5px 5px 5px 20px;
            top: ${NAVIGATION_HEIGHT}px;
            border-bottom-left-radius: 50px;
            right: 0;
            -webkit-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            -moz-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            background-clip: padding-box;
            z-index: 9;
        }
        .descriptionToolbox .btn.formDescriptionTool {
            margin-left: 4px;
            padding: 0;
            touch-action: auto;
            cursor: move;
        }
        .descriptionToolbox .btn.formDescriptionTool:hover {
            background-color: #ddffee;
        }
        .descriptionToolbox .btn.formDescriptionTool:hover span:before {
            content: ' Drag';
            font-weight: 900;
            line-height: initial;
        }
        .toolSection:before {
            content: ' Section';
        }
        .toolQuestion:before {
            content: ' Question';
        }
        .toolForm:before {
            content: ' Form';
        }
        .toolCopySection:before {
            content: ' Paste';
        }
        .toolbar-icon {
            font-size: 20px;
            height: 20px;
            width: 20px;
        }
    `]
})

export class FormDescriptionComponent implements OnInit, AfterViewInit {
    @Input() set elt(form: CdeForm) {
        this._elt = form;
        this.addExpanded(form);
        addFormIds(form);
    }

    get elt() {
        return this._elt;
    }

    private _elt!: CdeForm;
    @Input() canEdit = false;
    @Output() eltChange = new EventEmitter<void>();
    @ViewChild(TreeComponent, {static: false}) tree!: TreeComponent;
    @ViewChild('formSearchTmpl', {static: true}) formSearchTmpl!: TemplateRef<any>;
    @ViewChild('questionSearchTmpl', {static: true}) questionSearchTmpl!: TemplateRef<any>;
    @ViewChild('descToolbox', {static: true}) descToolbox!: ElementRef;
    addQuestionDialogRef?: MatDialogRef<any, any>;
    dragActive = false;
    formElementEditing: any = {};
    isModalOpen = false;
    newDataElement: DataElement = this.initNewDataElement();
    questionModelMode = 'search';
    treeOptions = {
        allowDrag: (element: TreeNode) => !FormDescriptionComponent.isSubForm(element)
            || element.data.elementType === 'form' && !FormDescriptionComponent.isSubForm(element.parent),
        allowDrop: (element: any, {parent, index}: any) => {
            return element !== parent && parent.data.elementType !== 'question' && (!element
                || !element.ref && (element.data.elementType !== 'question' || parent.data.elementType === 'section')
                || element.ref === 'section' || element.ref === 'form' || element.ref === 'pasteSection'
                || (element.ref === 'question' && parent.data.elementType === 'section')
            ) && !FormDescriptionComponent.isSubForm(parent);
        },
        actionMapping: {
            mouse: {
                drag: () => this.dragActive = true,
                dragEnd: () => this.dragActive = false,
                drop: (tree: TreeModel, node: TreeNode, $event: any, {from, to}: any) => {
                    if (from.ref) {
                        this.formElementEditing = {
                            formElements: to.parent.data.formElements,
                            index: to.index
                        };
                        if (from.ref === 'section') {
                            const newSection = new FormSection();
                            this.formElementEditing.formElement = newSection;
                            this.addFormElement(newSection);
                        } else if (from.ref === 'question') {
                            this.openQuestionSearch();
                        } else if (from.ref === 'form') {
                            this.openFormSearch();
                        } else if (from.ref === 'pasteSection') {
                            const copiedSection: FormSection = this.localStorageService.getItem('sectionCopied');
                            this.formElementEditing.formElement = copiedSection;
                            this.addFormElement(copiedSection);
                        } else {
                            TREE_ACTIONS.MOVE_NODE(tree, node, $event, {from, to});
                            addFormIds(this.elt);
                            this.updateTree();
                            // this.onEltChange.emit(); treeEvent will handle
                        }
                    } else {
                        TREE_ACTIONS.MOVE_NODE(tree, node, $event, {from, to});
                        addFormIds(this.elt);
                        this.updateTree();
                        this.dragActive = false;
                        // this.onEltChange.emit(); treeEvent will handle
                    }
                }
            }
        },
        childrenField: 'formElements',
        displayField: 'label',
        isExpandedField: 'expanded'
    };
    updateDataCredit = 0;

    constructor(
        public deCompletionService: DeCompletionService,
        private _hotkeysService: HotkeysService,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        public matDialog: MatDialog,
    ) {
    }

    @HostListener('window:scroll', ['$event']) scrollEvent() {
        this.doIt();
    }

    ngOnInit(): void {
        this._hotkeysService.add([
            new Hotkey('q', (event: KeyboardEvent): boolean => {
                if (!this.isModalOpen && !_isEmpty(this.formElementEditing) &&
                    this.formElementEditing.formElement && this.formElementEditing.formElement.elementType === 'question') {
                    this.formElementEditing.index++;
                    this.openQuestionSearch();
                }
                return false;
            })
        ]);
    }

    ngAfterViewInit(): void {
        this.doIt();
    }

    addExpanded(fe: FormOrElement) {
        fe.expanded = true;
        const expand = (fe: FormElement) => {
            fe.expanded = true;
        };
        iterateFeSync(fe, undefined, expand, expand);
    }

    addFormElement(fe: FormElement) {
        if (this.formElementEditing.formElements) {
            this.formElementEditing.formElements.splice(this.formElementEditing.index, 0, fe);
        }
        addFormIds(this.elt);
        this.updateTree();
        // this.onEltChange.emit(); treeEvent will handle
    }

    addFormFromSearch(form: CdeForm, cb: Cb<FormInForm> = _noop) {
        this.http.get<CdeForm>('/api/form/' + form.tinyId).subscribe(form => {
            const inForm = convertFormToSection(form);
            if (!inForm) {
                return;
            }
            this.addExpanded(inForm);
            this.formElementEditing.formElement = inForm;
            this.addFormElement(inForm);
            this.setCurrentEditing(this.formElementEditing.formElements, inForm, this.formElementEditing.index);
            this.isModalOpen = false;
            cb(inForm);
        });
    }

    addQuestionFromSearch(de: DataElement) {
        FormService.convertCdeToQuestion(de, question => {
            if (!question) {
                return;
            }
            question.formElements = [];
            question.expanded = true;
            question.edit = true;
            this.addFormElement(question);
            this.setCurrentEditing(this.formElementEditing.formElements, question, this.formElementEditing.index);
            waitRendered(
                () => !!document.getElementById('question_' + question.feId),
                () => scrollTo('question_' + question.feId)
            );
            this.isModalOpen = false;
        });
    }

    doIt() {
        if (this && this.descToolbox && this.descToolbox.nativeElement) {
            this.descToolbox.nativeElement.style.top = (window.pageYOffset > NAVIGATION_HEIGHT ? 0
                : (NAVIGATION_HEIGHT - window.pageYOffset)) + 'px';
        }
    }

    hasCopiedSection() {
        return this.localStorageService.getItem('sectionCopied');
    }

    initNewDataElement(): DataElement {
        this.deCompletionService.suggestedCdes = [];

        const de = new DataElement();
        de.designations.push({designation: '', tags: ['Question Text']});
        de.valueDomain.datatype = 'Text';
        return de;
    }

    openFormSearch() {
        this.isModalOpen = true;
        this.matDialog.open(this.formSearchTmpl, {width: '1200px'})
            .afterClosed().subscribe(() => this.isModalOpen = false);
    }

    openQuestionSearch() {
        this.isModalOpen = true;
        this.newDataElement = this.initNewDataElement();
        this.addQuestionDialogRef = this.matDialog.open(this.questionSearchTmpl, {width: '1200px'});
        this.addQuestionDialogRef.afterClosed().subscribe(() => this.isModalOpen = false);

        setTimeout(() => {
            if (this.questionModelMode === 'add') {
                const newDeElement = document.getElementById('newDEName');
                if (newDeElement) {
                    newDeElement.focus();
                }
            }
        }, 0);
    }

    createNewDataElement(newCde: DataElement = this.newDataElement) {
        this.addQuestionFromSearch(newCde);
        if (this.addQuestionDialogRef) {
            this.addQuestionDialogRef.close();
        }
    }

    setCurrentEditing(formElements: FormElement[], formElement: FormElement, index: number) {
        if (_isEmpty(this.formElementEditing.formElement)) {
            this.formElementEditing = {
                formElement,
                formElements,
                index
            };
        } else {
            if (this.formElementEditing.formElement === formElement) {
                this.formElementEditing = {};
            } else {
                this.formElementEditing.formElement.edit = false;
                this.formElementEditing = {
                    formElement,
                    formElements,
                    index
                };
            }
        }
    }

    treeEvents(event: any) {
        if (event && event.eventName === 'updateData' && this.updateDataCredit === 0) {
            this.eltChange.emit();
        }
        if (event && event.eventName === 'moveNode') {
            this.updateDataCredit++;
            setTimeout(() => this.updateDataCredit = 0, 100);
        }
    }

    updateTree() {
        this.tree.treeModel.update();
        // @TODO: if node passed in, expand all node only, else no expand
        this.tree.treeModel.expandAll();
    }

    static isSubForm(node: TreeNode): boolean {
        let n = node;
        while (n && n.data && n.data.elementType !== 'form' && n.parent) {
            n = n.parent;
        }
        return n && n.data && n.data.elementType === 'form';
    }
}
