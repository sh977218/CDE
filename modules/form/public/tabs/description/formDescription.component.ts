import {
    Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output, TemplateRef,
    ViewChild, ViewRef
} from "@angular/core";
import { Http } from "@angular/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TREE_ACTIONS, TreeComponent } from "angular-tree-component";

import { FormService } from "../../form.service";
import { CdeForm, FormElement, FormSection } from "../../form.model";

@Component({
    selector: "cde-form-description",
    templateUrl: "formDescription.component.html",
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
            z-index: 1029;
            -webkit-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            -moz-box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            background-clip: padding-box;
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
    `]
})
export class FormDescriptionComponent implements OnInit {
    @Input() cache: any;
    @Input() elt: CdeForm;
    @Input() inScoreCdes: any;
    @Output() cachePut: EventEmitter<any> = new EventEmitter<any>();
    @Output() isFormValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild(TreeComponent) public tree: TreeComponent;
    @ViewChild("formSearchTmpl") formSearchTmpl: TemplateRef<any>;
    @ViewChild("questionSearchTmpl") questionSearchTmpl: TemplateRef<any>;

    @ViewChild("descToolbox") descToolbox: ElementRef;

    @HostListener('window:scroll', ['$event']) doIt() {
        this.descToolbox.nativeElement.style.top = (window.pageYOffset > 50 ? 0 : (50 - window.pageYOffset)) + 'px';
    }

    addIndex = function (elems, elem, i) { return elems.splice(i, 0, elem); };
    toolDropTo: {index: number, parent: any};
    toolSection: {insert: 'section', data: FormElement};
    treeOptions = {
        allowDrag: (element) => {
            return !FormService.isSubForm(element) || element.data.elementType === "form" && !FormService.isSubForm(element.parent);
        },
        allowDrop: (element, {parent, index}) => {
            return element !== parent && parent.data.elementType !== "question" && (!element
                    || !element.ref && (element.data.elementType !== "question" || parent.data.elementType === "section")
                    || element.ref === "form"
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
                        if (from.ref === "question")
                            this.openQuestionSearch();
                        else if (from.ref === "form")
                            this.openFormSearch();
                        this.toolDropTo = to;
                        return;
                    } else
                        TREE_ACTIONS.MOVE_NODE(tree, node, $event, {from, to});

                    tree.expandAll();
                    this.addIds(this.elt.formElements, "");
                    this.stageElt.emit();
                }
            }
        },
        childrenField: "formElements",
        displayField: "label",
        dropSlotHeight: 3,
        isExpandedField: "id"
    };

    constructor(private formService: FormService,
                public modalService: NgbModal,
                @Inject("isAllowedModel") public isAllowedModel) {
        this.toolSection = {insert: "section", data: this.getNewSection()};
    }

    ngOnInit() {
        this.addIds(this.elt.formElements, "");
    }

    addQuestionFromSearch(cde) {
        this.formService.convertCdeToQuestion(cde, question => {
            question.formElements = [];
            this.addIndex(this.toolDropTo.parent.data.formElements, question, this.toolDropTo.index++);
            this.tree.treeModel.update();
            this.tree.treeModel.expandAll();
            this.addIds(this.elt.formElements, "");
            this.stageElt.emit();
        });
    }

    addFormFromSearch(fe) {
        let inForm: any = FormService.convertFormToSection(fe);
        inForm.formElements = [];
        this.addIndex(this.toolDropTo.parent.data.formElements, inForm, this.toolDropTo.index++);
        this.tree.treeModel.update();
        this.tree.treeModel.expandAll();
        this.addIds(this.elt.formElements, "");
        this.stageElt.emit();
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
}