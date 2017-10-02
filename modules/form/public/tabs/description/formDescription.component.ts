import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Inject,
    Input, OnChanges,
    Output, SimpleChanges,
    TemplateRef,
    ViewChild
} from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TREE_ACTIONS, TreeComponent } from "angular-tree-component";
import { LocalStorageService } from 'angular-2-local-storage';
import * as _ from 'lodash';

import { FormService } from "../../form.service";
import { CdeForm, FormElement, FormSection } from "../../form.model";
import { copySectionAnimation } from 'form/public/tabs/description/copySectionAnimation';

@Component({
    selector: "cde-form-description",
    templateUrl: "formDescription.component.html",
    animations: [copySectionAnimation],
    styles: [`
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

        .node-content-wrapper.is-dragging-over {
            background-color: #ddffee;
            box-shadow: inset 0 0 1px #999;
        }

        .panel-body-form {
            background-color: #eee;
        }

        .descriptionToolbox {
            color: #9d9d9d;
            background-color: #222;
            position: fixed;
            padding: 5px;
            padding-left: 20px;
            top: 50px;
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
export class FormDescriptionComponent implements OnChanges {
    @Input() elt: CdeForm;
    @Input() canEdit: boolean = false;
    @Input() inScoreCdes: any;
    @Output() isFormValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onEltChange = new EventEmitter();

    @ViewChild(TreeComponent) public tree: TreeComponent;
    @ViewChild("formSearchTmpl") formSearchTmpl: TemplateRef<any>;
    @ViewChild("questionSearchTmpl") questionSearchTmpl: TemplateRef<any>;

    @ViewChild("descToolbox") descToolbox: ElementRef;

    @HostListener('window:scroll', ['$event'])
    doIt() {
        this.descToolbox.nativeElement.style.top = (window.pageYOffset > 50 ? 0 : (50 - window.pageYOffset)) + 'px';
    }

    addIndex = function (elems, elem, i) {
        return elems.splice(i, 0, elem);
    };
    toolDropTo: { index: number, parent: any };
    toolSection: { insert: 'section', data: FormElement };
    treeOptions = {
        allowDrag: (element) => {
            return !FormService.isSubForm(element) || element.data.elementType === "form" && !FormService.isSubForm(element.parent);
        },
        allowDrop: (element, {parent, index}) => {
            return element !== parent && parent.data.elementType !== "question" && (!element
                || !element.ref && (element.data.elementType !== "question" || parent.data.elementType === "section")
                || element.ref === "form"
                || element.ref === "pasteSection"
                || element.ref === "question" && parent.data.elementType === "section"
            ) && !FormService.isSubForm(parent);
        },
        actionMapping: {
            mouse: {
                drop: (tree, node, $event, {from, to}) => {
                    if (from.insert) {
                        this.addIndex(to.parent.data.formElements, this.getNewSection(), to.index);
                        tree.update();
                    } else if (from.ref) {
                        this.toolDropTo = to;
                        if (from.ref === "question")
                            this.openQuestionSearch();
                        else if (from.ref === "form")
                            this.openFormSearch();
                        else if (from.ref === "pasteSection")
                            this.pasteSection();
                        return;
                    } else
                        TREE_ACTIONS.MOVE_NODE(tree, node, $event, {from, to});

                    tree.expandAll();
                    this.addIds(this.elt.formElements, "");
                    this.onEltChange.emit();
                }
            }
        },
        childrenField: "formElements",
        displayField: "label",
        dropSlotHeight: 3,
        isExpandedField: "expanded"
    };

    ngOnChanges(changes: SimpleChanges) {
        if (changes.elt) {
            this.addExpanded(this.elt);
            this.addIds(this.elt.formElements, "");
        }
    }

    constructor(private localStorageService: LocalStorageService,
                public modalService: NgbModal,
                private formService: FormService) {
        this.toolSection = {insert: "section", data: this.getNewSection()};
    }

    addQuestionFromSearch(cde) {
        this.formService.convertCdeToQuestion(cde, question => {
            question.formElements = [];
            question.expanced = true;
            this.addIndex(this.toolDropTo.parent.data.formElements, question, this.toolDropTo.index++);
            this.tree.treeModel.update();
            this.tree.treeModel.expandAll();
            this.addIds(this.elt.formElements, "");
            this.onEltChange.emit();
        });
    }

    addFormFromSearch(fe) {
        let inForm: any = FormService.convertFormToSection(fe);
        inForm.formElements = [];
        this.addIndex(this.toolDropTo.parent.data.formElements, inForm, this.toolDropTo.index++);
        this.tree.treeModel.update();
        this.tree.treeModel.expandAll();
        this.addIds(this.elt.formElements, "");
        this.onEltChange.emit();
    }

    addExpanded(fe) {
        fe.expanded = true;
        FormService.iterateFeSync(fe, _.noop, fe => fe.expanded = true, fe => fe.expanded = true);
    }

    addIds(fes, preId) {
        fes.forEach((fe, i) => {
            let newPreId = preId + "_" + i;
            if (fe.elementType === "section" || fe.elementType === "form") {
                fe.descriptionId = (fe.elementType === "section" ? "section" + newPreId : "inform" + newPreId);
                if (fe.formElements && fe.formElements.length > 0)
                    this.addIds(fe.formElements, newPreId);
            } else if (fe.elementType === "question")
                fe.descriptionId = "question" + newPreId;
        });
    }

    getNewSection() {
        return new FormSection;
    }

    hasCopiedSection() {
        let copiedSection = this.localStorageService.get("sectionCopied");
        return !_.isEmpty(copiedSection);
    }

    openFormSearch() {
        this.modalService.open(this.formSearchTmpl, {size: "lg"}).result.then(() => {
        }, () => {
        });
    }

    openQuestionSearch() {
        this.modalService.open(this.questionSearchTmpl, {size: "lg"}).result.then(() => {
        }, () => {
        });
    }


    pasteSection() {
        let fe = this.localStorageService.get("sectionCopied");
        this.addIndex(this.toolDropTo.parent.data.formElements, fe, this.toolDropTo.index++);
        this.tree.treeModel.update();
        this.tree.treeModel.expandAll();
        this.addIds(this.elt.formElements, "");
        this.onEltChange.emit();
    }

    stageParent() {
        this.onEltChange.emit();
    }
}