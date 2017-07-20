import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Http, Response } from "@angular/http";
import { NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

import { FormService } from "../../form.service";
import { CdeForm, FormElement, FormQuestion } from "../../form.model";
import { TreeNode } from "angular-tree-component";

@Component({
    selector: "cde-form-description-question",
    templateUrl: "formDescriptionQuestion.component.html"
})
export class FormDescriptionQuestionComponent implements OnInit {
    @Input() elt: CdeForm;
    @Input() node: TreeNode;
    @Input() inScoreCdes: any;
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild("updateCdeVersionTmpl") updateCdeVersionTmpl: NgbModalModule;

    isSubForm = false;
    updateCdeVersion: any;

    question: FormQuestion;
    parent: FormElement;

    constructor(@Inject("isAllowedModel") public isAllowedModel,
                public formService: FormService,
                private http: Http,
                public modalService: NgbModal) {}

    ngOnInit() {
        this.question = this.node.data;
        this.parent = this.node.parent.data;
        this.isSubForm = FormService.isSubForm(this.node);
    }

    getDatatypeLabel(question) {
        let datatype = question.question.datatype;
        if (datatype === "Number") {
            return "(Number)";
        } else if (datatype === "Date") {
            return "(Date)";
        } else return "";
    }

    isScore(formElt) {
        return formElt.question.cde.derivationRules && formElt.question.cde.derivationRules.length > 0;
    }

    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.stageElt.emit();
    }

    openUpdateCdeVersion(question) {
        this.http.get('/dataElement/tinyId/' + question.question.cde.tinyId).map((res: Response) => res.json())
            .subscribe((response) => {
                this.formService.convertCdeToQuestion(response, (newQuestion) => {
                    this.updateCdeVersion = (() => {
                        let modal: any = {
                            currentQuestion: question,
                            newQuestion: newQuestion
                        };
                        let currentQuestion = question;

                        newQuestion.question.editable = currentQuestion.question.editable;
                        newQuestion.question.instructions = currentQuestion.question.instructions;
                        newQuestion.question.invisible = currentQuestion.question.invisible;
                        newQuestion.question.multiselect = currentQuestion.question.multiselect;
                        newQuestion.question.required = currentQuestion.question.required;
                        newQuestion.question.skipLogic = currentQuestion.question.skipLogic;
                        newQuestion.repeat = currentQuestion.repeat;

                        this.http.get("/dataElement/tinyId/" + newQuestion.question.cde.tinyId).map((res: Response) => res.json())
                            .subscribe((newCde) => {
                                let cdeUrl = currentQuestion.question.cde.tinyId +
                                    (currentQuestion.question.cde.version ? "/" + currentQuestion.question.cde.version : "");
                                this.http.get("/dataElement/" + cdeUrl).map((res: Response) => res.json())
                                    .subscribe((oldCde) => {
                                        modal.bLabel = !_.isEqual(newCde.naming, oldCde.naming);
                                    });
                                let found = false;
                                newCde.naming.forEach(function (result) {
                                    if (result.designation === currentQuestion.label) found = true;
                                });
                                if (found) newQuestion.label = currentQuestion.label;
                            });

                        modal.bCde = true;
                        modal.bDatatype = currentQuestion.question.datatype !== newQuestion.question.datatype;
                        modal.bUom = !_.isEqual(currentQuestion.question.uoms, newQuestion.question.uoms);

                        if (newQuestion.question.datatype === "Number") {
                            if (currentQuestion.question.datatype === "Number" &&
                                currentQuestion.question.datatypeNumber &&
                                newQuestion.question.datatypeNumber) {
                                modal.bNumberMin = currentQuestion.question.datatypeNumber.minValue
                                    !== newQuestion.question.datatypeNumber.minValue;
                                modal.bNumberMax = currentQuestion.question.datatypeNumber.maxValue
                                    !== newQuestion.question.datatypeNumber.maxValue;
                            } else {
                                modal.bNumberMin = modal.bNumberMax = true;
                            }
                        }
                        if (newQuestion.question.datatype === "Value List") {
                            if (currentQuestion.question.datatype === "Value List") {
                                modal.bValuelist = !_.isEqual(currentQuestion.question.cde.permissibleValues,
                                    newQuestion.question.cde.permissibleValues);
                                if (!modal.bValuelist) newQuestion.question.answers = currentQuestion.question.answers;

                                if (currentQuestion.question.defaultAnswer && newQuestion.question.answers.filter(a => a.permissibleValue === currentQuestion.question.defaultAnswer).length > 0)
                                    newQuestion.question.defaultAnswer = currentQuestion.question.defaultAnswer;
                            } else {
                                modal.bValuelist = true;
                            }
                        }
                        modal.bDefault = _.toString(currentQuestion.question.defaultAnswer) !== _.toString(newQuestion.question.defaultAnswer);

                        return modal;
                    })();

                    let self = this;

                    this.modalService.open(this.updateCdeVersionTmpl).result.then(function () {
                        question.question = newQuestion.question;
                        question.label = newQuestion.label;
                        self.stageElt.emit();
                    });
                });
            });
    }
}