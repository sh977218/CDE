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
    newDataElementName;
    formElementEditing: any = {};

    @HostListener('window:scroll', ['$event'])
    scrollEvent() {
        this.doIt();
    }

    doIt() {
        if (this && this.descToolbox && this.descToolbox.nativeElement)
            this.descToolbox.nativeElement.style.top = (window.pageYOffset > TOOL_BAR_OFF_SET ? 0 : (TOOL_BAR_OFF_SET - window.pageYOffset)) + 'px';
    }

    toolDropTo: { index: number, parent: any };
    toolSection: { insert: 'section', data: FormElement };
    treeOptions = {
        allowDrag: (element) => {
            return !FormService.isSubForm(element) || element.data.elementType === 'form' && !FormService.isSubForm(element.parent);
        },
        allowDrop: (element, {parent, index}) => {
            return element !== parent && parent.data.elementType !== 'question' && (!element
                || !element.ref && (element.data.elementType !== 'question' || parent.data.elementType === 'section')
                || element.ref === 'form'
                || element.ref === 'pasteSection'
                || element.ref === 'question' && parent.data.elementType === 'section'
            ) && !FormService.isSubForm(parent);
        },
        actionMapping: {
            mouse: {
                drop: (tree, node, $event, {from, to}) => {
                    if (from.insert) {
                        this.addIndex(to.parent.data.formElements, new FormSection(), to.index);
                        tree.update();
                    } else if (from.ref) {
                        this.toolDropTo = to;
                        if (from.ref === 'question') {
                            this.openQuestionSearch(to, tree);
                            return;
                        } else if (from.ref === 'form') {
                            this.openFormSearch();
                            return;
                        } else if (from.ref === 'pasteSection') {
                            this.pasteSection();
                            return;
                        }
                    } else
                        TREE_ACTIONS.MOVE_NODE(tree, node, $event, {from, to});

                    tree.expandAll();
                    this.addIds(this.elt.formElements, '');
                    this.onEltChange.emit();
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
        this.toolSection = {insert: "section", data: new FormSection()};
    }

    ngOnInit(): void {
        this._hotkeysService.add([
            new Hotkey('q', (event: KeyboardEvent): boolean => {
                if (!_isEmpty(this.formElementEditing)) {
                    this.newDataElementName = "";
                    this.modalService.open(this.questionSearchTmpl, {size: "lg"}).result.then(reason => {
                        if (reason === 'create') {
                            // let newQuestion = this.getNewQuestion();
                            let newQuestion = new FormQuestion;
                            newQuestion.newCde = true;
                            newQuestion.edit = true;
                            newQuestion.label = this.newDataElementName;
                            newQuestion.question.cde.naming = [{designation: this.newDataElementName}];
                            this.formElementEditing.index = this.formElementEditing.index + 1;
                            this.addIndex(this.formElementEditing.formElements, newQuestion, this.formElementEditing.index);
                            this.tree.treeModel.update();
                            this.tree.treeModel.expandAll();
                            this.addIds(this.elt.formElements, "");
                            this.setCurrentEditing(this.formElementEditing.formElements, newQuestion, this.formElementEditing.index);
                            this.onEltChange.emit();
                            setTimeout(() => {
                                window.document.getElementById((newQuestion as any).descriptionId).scrollIntoView();
                            }, 0);
                        }
                    }, () => {
                    });
                    setTimeout(() => window.document.getElementById("newDEName").focus(), 0);
                }
                return false;
            })
        ]);
    }

    ngAfterViewInit(): void {
        this.doIt();
    }

    addIndex(elements, element, i) {
        return elements.splice(i, 0, element);
    }

    addQuestionFromSearch(cde) {
        this.formService.convertCdeToQuestion(cde, question => {
            question.formElements = [];
            question.expanded = true;
            this.addIndex(this.toolDropTo.parent.data.formElements, question, this.toolDropTo.index++);
            this.tree.treeModel.update();
            this.tree.treeModel.expandAll();
            this.addIds(this.elt.formElements, '');
            this.setCurrentEditing(this.toolDropTo.parent.data.formElements, question, this.toolDropTo.index);
            this.onEltChange.emit();
        });
    }

    addFormFromSearch(fe) {
        this.http.get('/form/' + fe.tinyId).map(r => r.json()).subscribe(form => {
            let inForm: any = FormService.convertFormToSection(form);
            inForm.formElements = form.formElements;
            this.addIndex(this.toolDropTo.parent.data.formElements, inForm, this.toolDropTo.index++);
            this.tree.treeModel.update();
            this.tree.treeModel.expandAll();
            this.addIds(this.elt.formElements, '');
            this.setCurrentEditing(this.toolDropTo.parent.data.formElements, inForm, this.toolDropTo.index);
            this.onEltChange.emit();
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
        let copiedSection = this.localStorageService.get('sectionCopied');
        return !_isEmpty(copiedSection);
    }

    openFormSearch() {
        this.modalService.open(this.formSearchTmpl, {size: 'lg'}).result.then(() => {
        }, () => {
        });
    }

    openQuestionSearch(to, tree) {
        this.newDataElementName = '';
        this.modalService.open(this.questionSearchTmpl, {size: 'lg'}).result.then(reason => {
            if (reason === 'create') {
                // let newQuestion = this.getNewQuestion();
                let newQuestion = new FormQuestion();
                newQuestion.newCde = true;
                newQuestion.edit = true;
                newQuestion.label = this.newDataElementName;
                newQuestion.question.cde.naming = [{designation: this.newDataElementName}];
                this.addIndex(to.parent.data.formElements, newQuestion, to.index);
                tree.update();
                tree.expandAll();
                this.addIds(this.elt.formElements, '');
                this.setCurrentEditing(this.elt.formElements, newQuestion, to.index);
                this.onEltChange.emit();
            }
        }, () => {
        });
    }

    pasteSection() {
        let fe = this.localStorageService.get('sectionCopied');
        this.addIndex(this.toolDropTo.parent.data.formElements, fe, this.toolDropTo.index++);
        this.tree.treeModel.update();
        this.tree.treeModel.expandAll();
        this.addIds(this.elt.formElements, '');
        this.onEltChange.emit();
    }

    setCurrentEditing(formElements, formElement, index) {
        if (_isEmpty(this.formElementEditing.formElement)) {
            this.formElementEditing = {
                formElement: formElement,
                formElements: formElements,
                index: index
            };
            formElement.edit = true;
        } else {
            if (this.formElementEditing.formElement === formElement) {
                this.formElementEditing = {};
                formElement.edit = false;
            } else {
                this.formElementEditing.formElement.edit = false;
                this.formElementEditing = {
                    formElement: formElement,
                    formElements: formElements,
                    index: index
                };
                formElement.edit = true;
            }
        }
    }
}