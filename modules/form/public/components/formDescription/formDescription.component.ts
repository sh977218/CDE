import './formDescription.global.scss';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TREE_ACTIONS, TreeComponent, TreeModel, TreeNode } from '@circlon/angular-tree-component';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { areDerivationRulesSatisfied } from 'core/form/fe';
import { convertFormToSection } from 'core/form/form';
import { DeCompletionService } from 'cde/public/components/completion/deCompletion.service';
import { copySectionAnimation } from 'form/public/components/formDescription/copySectionAnimation';
import { LocatableError } from 'form/public/components/formView.component';
import * as _isEmpty from 'lodash/isEmpty';
import { convertCdeToQuestion } from 'nativeRender/form.service';
import { scrollTo, waitRendered } from 'non-core/browser';
import { LocalStorageService } from 'non-core/localStorage.service';
import { DataElement } from 'shared/de/dataElement.model';
import { addFormIds, iterateFeSync } from 'shared/form/fe';
import { CdeForm, FormElement, FormInForm, FormOrElement, FormSection } from 'shared/form/form.model';
import { Cb1 } from 'shared/models.model';
import { canEditCuratedItem } from 'shared/security/authorizationShared';
import { noop } from 'shared/util';

@Component({
    selector: 'cde-form-description',
    templateUrl: './formDescription.component.html',
    animations: [copySectionAnimation],
    providers: [DeCompletionService],
    styleUrls: ['./formDescription.component.scss'],
})
export class FormDescriptionComponent implements OnInit {
    elt: any;
    @ViewChild(TreeComponent) tree!: TreeComponent;
    @ViewChild('formSearchTmpl', {static: true}) formSearchTmpl!: TemplateRef<any>;
    @ViewChild('questionSearchTmpl', {static: true}) questionSearchTmpl!: TemplateRef<any>;
    @ViewChild('confirmCancelTmpl', {static: true}) confirmCancelTmpl!: TemplateRef<any>;
    @ViewChild('descToolbox') descToolbox!: ElementRef;
    navHeight = NAVIGATION_HEIGHT + 'px';
    navHeightMobile = NAVIGATION_HEIGHT_MOBILE + 'px';
    addQuestionDialogRef?: MatDialogRef<any, any>;
    dragActive = false;
    formElementEditing: any = {};
    isMobile = false;
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
    missingCdes: string[] = [];
    validationErrors: LocatableError[] = [];
    topSpacing: number = 132;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        public deCompletionService: DeCompletionService,
        private _hotkeysService: HotkeysService,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        public userService: UserService,
        private alert: AlertService,
        public matDialog: MatDialog,
    ) {
        this.elt = this.route.snapshot.data.form;
        this.addExpanded(this.elt);
        addFormIds(this.elt);
        this.missingCdes = areDerivationRulesSatisfied(this.elt);
        CdeForm.validate(this.elt);
        this.onResize();
        this.topSpacing = this.isMobile ? 110 : 132;
        window.document.getElementById('scrollRoot')?.addEventListener('scroll', (e) => {
            if(((e.srcElement as HTMLInputElement).scrollTop > 100)){
                this.topSpacing = this.isMobile ? 0 : 22;
            }
            else{
                this.topSpacing = this.isMobile ? 110 : 132;
            }
        })
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

        const fragment = this.route.snapshot.fragment;
        if (fragment) {
            this.scrollToDescriptionId(fragment);
        }

    }


    scrollToDescriptionId(id: string) {
        setTimeout(scrollTo, 0, id);
    }

    canEdit() {
        return canEditCuratedItem(this.userService.user, this.elt);
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

    addFormFromSearch(form: CdeForm, cb: Cb1<FormInForm> = noop) {
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
        convertCdeToQuestion(de, question => {
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

    @HostListener('window:resize', [])
    onResize() {
        this.isMobile = window.innerWidth < 768;
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
            this.saveEdit();
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

    saveEdit() {
        this.http.put('/server/form/draft/' + this.elt.tinyId, this.elt)
            .subscribe((elt: any) => {
                this.missingCdes = areDerivationRulesSatisfied(this.elt);
                CdeForm.validate(this.elt);
                this.alert.addAlert('success', 'Saved');
                this.elt.__v = elt.__v;
            }, error => {
                this.alert.httpErrorMessageAlert(error);
                this.alert.addAlert('danger', 'Cannot save this old version. Reload and redo.')
            });
    }

    static isSubForm(node: TreeNode): boolean {
        let n = node;
        while (n && n.data && n.data.elementType !== 'form' && n.parent) {
            n = n.parent;
        }
        return n && n.data && n.data.elementType === 'form';
    }

}
