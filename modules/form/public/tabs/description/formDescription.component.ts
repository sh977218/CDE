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
import { Http } from '@angular/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TREE_ACTIONS, TreeComponent } from 'angular-tree-component';
import { LocalStorageService } from 'angular-2-local-storage';
import _isEmpty from 'lodash/isEmpty';
import _noop from 'lodash/noop';
import { Hotkey, HotkeysService } from "angular2-hotkeys";

import { copySectionAnimation } from 'form/public/tabs/description/copySectionAnimation';
import { CdeForm, FormElement, FormQuestion, FormSection } from 'core/form.model';
import { FormService } from 'nativeRender/form.service';

const TOOL_BAR_OFF_SET = 55;

@Component({
    selector: 'cde-form-description',
    templateUrl: 'formDescription.component.html',
    animations: [copySectionAnimation],
    styles: [`
        :host >>> .hover-bg {
            background-color: lightblue;
            border: 1px;
            border-radius: 10px;
        }

        :host >>> .badge {
            font-size: 100%;
        }

        :host >>> .tree {
            cursor: default;
        }

        :host >>> .panel {
            margin-bottom: 1px;
        }

        :host >>> .tree-children {
            padding-left: 0;
        }

        :host >>> .node-drop-slot {
            height: 10px;
            margin-bottom: 1px;
        }

        :host >>> .panel-badge-btn {
            color: white;
            background-color: #333;
        }

        :host >>> .badge.formViewSummaryLabel {
            display: inline-flex;
            margin-right: 4px;
            margin-top: 2px;
            white-space: normal;
        }

        .node-content-wrapper.is-dragging-over {
            background-color: #ddffee;
            box-shadow: inset 0 0 1px #999;
        }

        .panel-body-form {
            background-color: rgba(0, 0, 0, 0.03);
        }

        .descriptionToolbox {
            color: #9d9d9d;
            background-color: #343a40;
            position: fixed;
            padding: 5px;
            padding-left: 20px;
            top: ${TOOL_BAR_OFF_SET}px;
            border-bottom-left-radius: 50px;
            right: 0;
            -webkit-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            -moz-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            background-clip: padding-box;
            z-index: 9;
        }

        .descriptionToolbox .btn.formDescriptionTool {
            margin-left: 0;
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
    `]
})
export class FormDescriptionComponent implements OnInit, AfterViewInit {
    private _elt: CdeForm;
    @Input() set elt(e: CdeForm) {
        this._elt = e;
        this.addExpanded(e);
        this.addIds(e.formElements, "");
    };

    get elt() {
        return this._elt;
    }

    @Input() canEdit: boolean = false;
    @Output() onEltChange = new EventEmitter();
    @ViewChild(TreeComponent) public tree: TreeComponent;
    @ViewChild('formSearchTmpl') formSearchTmpl: TemplateRef<any>;
    @ViewChild('questionSearchTmpl') questionSearchTmpl: TemplateRef<any>;
    @ViewChild('descToolbox') descToolbox: ElementRef;

    questionModelMode = 'search';
    newDataElement = this.initNewDataElement();
    formElementEditing: any = {};
    isModalOpen: boolean = false;

    @HostListener('window:scroll', ['$event'])
    scrollEvent() {
        this.doIt();
    }

    doIt() {
        if (this && this.descToolbox && this.descToolbox.nativeElement)
            this.descToolbox.nativeElement.style.top = (window.pageYOffset > TOOL_BAR_OFF_SET ? 0 : (TOOL_BAR_OFF_SET - window.pageYOffset)) + 'px';
    }

    initNewDataElement() {
        return {
            naming: [{
                designation: '',
                tags: ['Question Text']
            }],
            valueDomain: {datatype: 'Text', permissibleValues: []}
        };
    }

    treeOptions = {
        allowDrag: element => !FormService.isSubForm(element) || element.data.elementType === 'form' && !FormService.isSubForm(element.parent),
        allowDrop: (element, {parent, index}) => {
            return element !== parent && parent.data.elementType !== 'question' && (!element
                || !element.ref && (element.data.elementType !== 'question' || parent.data.elementType === 'section')
                || element.ref === 'section' || element.ref === 'form' || element.ref === 'pasteSection'
                || (element.ref === 'question' && parent.data.elementType === 'section')
            ) && !FormService.isSubForm(parent);
        },
        actionMapping: {
            mouse: {
                drop: (tree, node, $event, {from, to}) => {
                    if (from.ref) {
                        this.formElementEditing = {
                            formElements: to.parent.data.formElements,
                            index: to.index
                        };
                        if (from.ref === 'section') {
                            let newSection = new FormSection();
                            this.formElementEditing.formElement = newSection;
                            this.addFormElement(newSection);
                        } else if (from.ref === 'question') {
                            this.openQuestionSearch();
                        } else if (from.ref === 'form') {
                            this.openFormSearch();
                        } else if (from.ref === 'pasteSection') {
                            let copiedSection = this.localStorageService.get('sectionCopied');
                            this.formElementEditing.formElement = copiedSection;
                            this.addFormElement(copiedSection);
                        } else {
                            TREE_ACTIONS.MOVE_NODE(tree, node, $event, {from, to});
                            this.addIds(this.elt.formElements, '');
                            this.tree.treeModel.update();
                            this.tree.treeModel.expandAll();
                            this.onEltChange.emit();
                        }
                    } else {
                        TREE_ACTIONS.MOVE_NODE(tree, node, $event, {from, to});
                        this.addIds(this.elt.formElements, '');
                        this.tree.treeModel.update();
                        this.tree.treeModel.expandAll();
                        this.onEltChange.emit();
                    }
                }
            }
        },
        childrenField: 'formElements',
        displayField: 'label',
        dropSlotHeight: 3,
        isExpandedField: 'expanded'
    };

    constructor(private http: Http,
                private localStorageService: LocalStorageService,
                public modalService: NgbModal,
                private formService: FormService,
                private _hotkeysService: HotkeysService) {
    }

    ngOnInit(): void {
        this._hotkeysService.add([
            new Hotkey('q', (event: KeyboardEvent): boolean => {
                if (!this.isModalOpen && !_isEmpty(this.formElementEditing) &&
                    this.formElementEditing.formElement && this.formElementEditing.formElement.elementType === 'question') {
                    this.formElementEditing.index++;
                    this.openQuestionSearch();
                } else return false;
            })
        ]);
    }

    ngAfterViewInit(): void {
        this.doIt();
    }

    addIndex(elements, element, i) {
        elements.splice(i, 0, element);
        this.addIds(this.elt.formElements, '');
    }

    addQuestionFromSearch(cde, cb = null) {
        this.formService.convertCdeToQuestion(cde, question => {
            question.formElements = [];
            question.expanded = true;
            question.edit = true;
            this.addFormElement(question);
            this.setCurrentEditing(this.formElementEditing.formElements, question, this.formElementEditing.index);
            setTimeout(() => window.document.getElementById(question.descriptionId).scrollIntoView(), 0);
            this.isModalOpen = false;
            if (cb) cb();
        });
    }

    addFormFromSearch(fe, cb = null) {
        this.http.get('/form/' + fe.tinyId).map(r => r.json()).subscribe(form => {
            let inForm: any = FormService.convertFormToSection(form);
            inForm.formElements = form.formElements;
            this.formElementEditing.formElement = inForm;
            this.addFormElement(inForm);
            this.setCurrentEditing(this.formElementEditing.formElements, inForm, this.formElementEditing.index);
            this.isModalOpen = false;
            if (cb) cb(inForm);
        });
    }

    addExpanded(fe) {
        fe.expanded = true;
        FormService.iterateFeSync(fe, _noop, fe => fe.expanded = true, fe => fe.expanded = true);
    }

    addIds(fes, preId) {
        fes.forEach((fe, i) => {
            let newPreId = preId + '_' + i;
            if (fe.elementType === 'section' || fe.elementType === 'form') {
                fe.descriptionId = (fe.elementType === 'section' ? 'section' + newPreId : 'inform' + newPreId);
                if (fe.formElements && fe.formElements.length > 0)
                    this.addIds(fe.formElements, newPreId);
            } else if (fe.elementType === 'question')
                fe.descriptionId = 'question' + newPreId;
        });
    }

    hasCopiedSection() {
        return !_isEmpty(this.localStorageService.get('sectionCopied'));
    }

    openFormSearch() {
        this.isModalOpen = true;
        this.modalService.open(this.formSearchTmpl, {size: 'lg'}).result.then(
            () => this.isModalOpen = false,
            () => this.isModalOpen = false);
    }

    openQuestionSearch() {
        this.isModalOpen = true;
        this.newDataElement = this.initNewDataElement();
        this.modalService.open(this.questionSearchTmpl, {size: 'lg'}).result.then(
            () => this.isModalOpen = false,
            () => this.isModalOpen = false);

        setTimeout(() => {
            if (this.questionModelMode === 'add') window.document.getElementById("newDEName").focus();
        }, 0);
    }

    createNewDataElement(c) {
        this.addQuestionFromSearch(this.newDataElement, () => {
            c();
        });
    }

    addFormElement(question) {
        this.addIndex(this.formElementEditing.formElements, question, this.formElementEditing.index);
        this.tree.treeModel.update();
        this.tree.treeModel.expandAll();
        this.onEltChange.emit();
    }

    setCurrentEditing(formElements, formElement, index) {
        if (_isEmpty(this.formElementEditing.formElement)) {
            this.formElementEditing = {
                formElement: formElement,
                formElements: formElements,
                index: index
            };
        } else {
            if (this.formElementEditing.formElement === formElement) {
                this.formElementEditing = {};
            } else {
                this.formElementEditing.formElement.edit = false;
                this.formElementEditing = {
                    formElement: formElement,
                    formElements: formElements,
                    index: index
                };
            }
        }
    }
}