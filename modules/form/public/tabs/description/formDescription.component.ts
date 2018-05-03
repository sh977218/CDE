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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TREE_ACTIONS, TreeComponent } from 'angular-tree-component';
import { LocalStorageService } from 'angular-2-local-storage';
import { Hotkey, HotkeysService } from "angular2-hotkeys";
import _isEmpty from 'lodash/isEmpty';
import _noop from 'lodash/noop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { AlertService } from '_app/alert/alert.service';
import { ElasticService } from '_app/elastic.service';
import { CdeForm, FormElement, FormElementsContainer, FormSection } from 'shared/form/form.model';
import { addFormIds, convertFormToSection, isSubForm, iterateFeSync } from 'shared/form/formShared';
import { copySectionAnimation } from 'form/public/tabs/description/copySectionAnimation';
import { FormService } from 'nativeRender/form.service';
import { SearchSettings } from 'search/search.model';

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
        :host >>> .node-content-wrapper:hover {
            background: transparent;
            box-shadow: inset 0 0 0;
        }
        .node-content-wrapper.is-dragging-over {
            background-color: #ddffee;
            box-shadow: inset 0 0 1px #999;
        }
        :host >>> div.node-drop-slot {
            height: 300px;
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
    @Input() canEdit: boolean = false;
    @Input() set elt(e: CdeForm) {
        this._elt = e;
        this.addExpanded(e);
        addFormIds(e);
    }
    get elt() {
        return this._elt;
    }
    @Output() onEltChange = new EventEmitter();
    @ViewChild(TreeComponent) public tree: TreeComponent;
    @ViewChild('formSearchTmpl') formSearchTmpl: TemplateRef<any>;
    @ViewChild('questionSearchTmpl') questionSearchTmpl: TemplateRef<any>;
    @ViewChild('descToolbox') descToolbox: ElementRef;
    formElementEditing: any = {};
    isModalOpen: boolean = false;
    newDataElement = this.initNewDataElement();
    questionModelMode = 'search';
    searchSettings = new SearchSettings;
    private searchTerms = new Subject<string>();
    suggestedCdes = [];
    treeOptions = {
        allowDrag: element => !isSubForm(element) || element.data.elementType === 'form' && !isSubForm(element.parent),
        allowDrop: (element, {parent, index}) => {
            return element !== parent && parent.data.elementType !== 'question' && (!element
                || !element.ref && (element.data.elementType !== 'question' || parent.data.elementType === 'section')
                || element.ref === 'section' || element.ref === 'form' || element.ref === 'pasteSection'
                || (element.ref === 'question' && parent.data.elementType === 'section')
            ) && !isSubForm(parent);
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
                            addFormIds(this.elt);
                            this.tree.treeModel.update();
                            this.tree.treeModel.expandAll();
                            this.onEltChange.emit();
                        }
                    } else {
                        TREE_ACTIONS.MOVE_NODE(tree, node, $event, {from, to});
                        addFormIds(this.elt);
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

    @HostListener('window:scroll', ['$event'])
    scrollEvent() {
        this.doIt();
    }

    doIt() {
        if (this && this.descToolbox && this.descToolbox.nativeElement) {
            this.descToolbox.nativeElement.style.top = (window.pageYOffset > TOOL_BAR_OFF_SET ? 0
                : (TOOL_BAR_OFF_SET - window.pageYOffset)) + 'px';
        }
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

        let settings = this.elasticService.buildElasticQuerySettings(this.searchSettings);
        this.searchTerms.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => {
                if (term) {
                    settings.resultPerPage = 5;
                    settings.searchTerm = term;
                    return this.http.post<any[]>('/cdeCompletion/' + encodeURI(term), this.elasticService.buildElasticQuerySettings(settings));
                } else return Observable.of<string[]>([]);
            })
        ).subscribe(res => {
            let tinyIdList = res.map(r => r._id).slice(0, 5);
            if (tinyIdList && tinyIdList.length > 0) {
                this.http.get<any[]>('/deList/' + tinyIdList).subscribe(result => {
                    this.suggestedCdes = result;
                }, err => this.alert.httpErrorMessageAlert(err));
            }
            else this.suggestedCdes = [];
        });
    }

    ngAfterViewInit(): void {
        this.doIt();
    }

    constructor(
        private alert: AlertService,
        private elasticService: ElasticService,
        private formService: FormService,
        private _hotkeysService: HotkeysService,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        public modalService: NgbModal,
    ) {}

    addExpanded(fe) {
        fe.expanded = true;
        let expand = fe => { fe.expanded = true; };
        iterateFeSync(fe, undefined, expand, expand);
    }

    addFormElement(fe) {
        this.addIndex(this.formElementEditing.formElements, fe, this.formElementEditing.index);
        this.tree.treeModel.update();
        this.tree.treeModel.expandAll();
        this.onEltChange.emit();
    }

    addFormFromSearch(fe, cb = null) {
        this.http.get<CdeForm>('/form/' + fe.tinyId).subscribe(form => {
            let inForm: FormElementsContainer = convertFormToSection(form);
            if (!inForm) return;
            this.addExpanded(inForm);
            this.formElementEditing.formElement = inForm;
            this.addFormElement(inForm);
            this.setCurrentEditing(this.formElementEditing.formElements, inForm, this.formElementEditing.index);
            this.isModalOpen = false;
            if (cb) cb(inForm);
        });
    }

    addIndex(elements, element, i) {
        elements.splice(i, 0, element);
        addFormIds(this.elt);
    }

    addQuestionFromSearch(cde, cb = null) {
        this.formService.convertCdeToQuestion(cde, question => {
            question.formElements = [];
            question.expanded = true;
            question.edit = true;
            this.addFormElement(question);
            this.setCurrentEditing(this.formElementEditing.formElements, question, this.formElementEditing.index);
            setTimeout(() => window.document.getElementById(question.feId).scrollIntoView(), 0);
            this.isModalOpen = false;
            if (cb) cb();
        });
    }

    hasCopiedSection() {
        return !_isEmpty(this.localStorageService.get('sectionCopied'));
    }

    initNewDataElement() {
        this.suggestedCdes = [];
        return {
            naming: [{
                designation: '',
                tags: ['Question Text']
            }],
            valueDomain: {datatype: 'Text', permissibleValues: []}
        };
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

    newDataElementNameChanged() {
        this.searchTerms.next(this.newDataElement.naming[0].designation);
    }

    createNewDataElement(newCde = this.newDataElement, cb) {
        this.addQuestionFromSearch(newCde, cb);
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