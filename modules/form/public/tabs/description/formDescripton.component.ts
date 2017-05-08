import { Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { Http, Response } from "@angular/http";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TREE_ACTIONS, TreeComponent } from "angular-tree-component";

import { FormService } from "../../form.service";

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
        .node-content-wrapper:hover {
            background-color: transparent;
            box-shadow: none;
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
        .descriptionToolbox .btn {
            margin-left: 0;
            padding: 5px;
            touch-action: auto;
        }
    `]
})
export class FormDescriptionComponent implements OnInit {
    @Input() cache: any;
    @Input() elt: any;
    @Input() inScoreCdes: any;
    @Output() cachePut: EventEmitter<any> = new EventEmitter<any>();
    @Output() isFormValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild(TreeComponent) public tree: TreeComponent;
    @ViewChild("formSearchTmpl") formSearchTmpl: TemplateRef<any>;
    @ViewChild("questionSearchTmpl") questionSearchTmpl: TemplateRef<any>;

    addIndex = function (elems, elem, i) { return elems.splice(i, 0, elem); };
    canCurate = false;
    toolDropTo: {index: number, parent: any};
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
                        this.addIndex(to.parent.data.formElements, from.data, to.index);
                        tree.update();
                    }
                    else if (from.ref) {
                        if (from.ref === "question")
                            this.openQuestionSearch();
                        else if (from.ref === "form")
                            this.openFormSearch();
                        this.toolDropTo = to;
                        return;
                    }
                    else
                        TREE_ACTIONS.MOVE_NODE(tree, node, $event, {from, to});
                    tree.expandAll();
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
                private http: Http,
                public modalService: NgbModal,
                @Inject("isAllowedModel") public isAllowedModel) {}

    ngOnInit() {
        this.canCurate = this.isAllowedModel.isAllowed(this.elt);
        this.addIds(this.elt.formElements, "");
    }

    addQuestionFromSearch(fe) {
        this.formService.convertCdeToQuestion(fe, question => {
            this.addIndex(this.toolDropTo.parent.data.formElements, question, this.toolDropTo.index++);
            this.tree.treeModel.update();
            this.tree.treeModel.expandAll();
            this.stageElt.emit();
        });
    }

    addFormFromSearch(fe) {
        this.addIndex(this.toolDropTo.parent.data.formElements, FormService.convertFormToSection(fe), this.toolDropTo.index++);
        this.tree.treeModel.update();
        this.tree.treeModel.expandAll();
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
        return {
            label: "New Section",
            skipLogic: {condition: ''},
            formElements: [],
            elementType: "section"
        };
    }

    openFormSearch() {
        this.modalService.open(this.formSearchTmpl, {size: "lg"}).result.then(result => {
        }, () => {
        });
    }

    openQuestionSearch() {
        this.modalService.open(this.questionSearchTmpl, {size: "lg"}).result.then(result => {
        }, () => {
        });
    }

    // sortableOptionsSections = {
    //     connectWith: ".dragSections",
    //     handle: ".fa.fa-arrows",
    //     revert: true,
    //     placeholder: "questionPlaceholder",
    //     start: function (event, ui) {
    //         $('.dragQuestions').css('border', '2px dashed grey');
    //         ui.placeholder.height("20px");
    //     },
    //     stop: function () {
    //         $('.dragQuestions').css('border', '');
    //     },
    //     receive: function (e, ui) {
    //         if (!ui.item.sortable.moved) {
    //             ui.item.sortable.cancel();
    //             return;
    //         }
    //         if (ui.item.sortable.moved.tinyId || ui.item.sortable.moved.elementType === "question")
    //             ui.item.sortable.cancel();
    //     },
    //     helper: function () {
    //         return $('<div class="placeholderForDrop"><i class="fa fa-arrows"></i> Drop Me</div>')
    //     }
    // };
    //
    // sortableOptions = {
    //     connectWith: ".dragQuestions",
    //     handle: ".fa.fa-arrows",
    //     revert: true,
    //     placeholder: "questionPlaceholder",
    //     start: function (event, ui) {
    //         $('.dragQuestions').css('border', '2px dashed grey');
    //         ui.placeholder.height("20px");
    //     },
    //     stop: function () {
    //         $('.dragQuestions').css('border', '');
    //     },
    //     helper: function () {
    //         return $('<div class="placeholderForDrop"><i class="fa fa-arrows"></i> Drop Me</div>')
    //     },
    //     receive: function (e, ui) {
    //         let elt = ui.item.sortable.moved;
    //         if (elt.valueDomain) {
    //             this.convertCdeToQuestion(elt, function (question) {
    //                 ui.item.sortable.moved = question;
    //             });
    //         } else if (elt.naming) {
    //             ui.item.sortable.moved = FormDescriptionComponent.convertFormToSection(elt);
    //         }
    //         this.stageElt.emit();
    //     },
    //     update: function () {
    //         this.stageElt.emit();
    //     }
    // };
}