import {
    Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, TemplateRef,
    ViewChild
} from "@angular/core";
import { Http, Response } from "@angular/http";
import { NgbModal, NgbModalModule, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";
import { Observable } from "rxjs/Observable";

import { SkipLogicService } from "../../skipLogic.service";
import { CdeForm, FormElement, FormQuestion, SkipLogic } from "../../form.model";
import { TreeNode } from "angular-tree-component";
import { FormattedValue } from "../../../../core/public/models.model";

@Component({
    selector: "cde-form-description-question-detail",
    templateUrl: "formDescriptionQuestionDetail.component.html"
})
export class FormDescriptionQuestionDetailComponent implements OnInit {
    @Input() elt: CdeForm;
    @Input() node: TreeNode;
    @Output() isFormValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild("formDescriptionNameSelectTmpl") formDescriptionNameSelectTmpl: NgbModalModule;
    @ViewChild("formDescriptionQuestionTmpl") formDescriptionQuestionTmpl: TemplateRef<any>;
    @ViewChild("formDescriptionQuestionEditTmpl") formDescriptionQuestionEditTmpl: TemplateRef<any>;
    @ViewChild("slInput") slInput: ElementRef;

    answersOptions: any = {
        allowClear: true,
        multiple: true,
        placeholder: {
            id: "",
            placeholder: "Leave blank to ..."
        },
        tags: true,
        language: {
            noResults: () => {
                return "No Answer List entries are listed on the CDE.";
            }
        }
    };
    answersSelected: Array<string>;
    nameSelectModal: any = {};
    nameSelectModalRef: NgbModalRef;
    question: FormQuestion;
    parent: FormElement;
    uomOptions: any = {
        multiple: true,
        tags: true,
        language: {
            noResults: () => {
                return "No Units of Measure are listed on the CDE. Type in more followed by ENTER.";
            }
        }
    };

    constructor(@Inject("isAllowedModel") public isAllowedModel,
                private http: Http,
                public modalService: NgbModal,
                public skipLogicService: SkipLogicService) {
        this.nameSelectModal.checkAndUpdateLabel = (section, doUpdate = false, selectedNaming = false) => {
            section.formElements.forEach((fe) => {
                if (fe.skipLogic && fe.skipLogic.condition) {
                    let updateSkipLogic = false;
                    let tokens = this.skipLogicService.tokenSplitter(fe.skipLogic.condition);
                    tokens.forEach((token, i) => {
                        if (i % 2 === 0 && token === '"' + this.nameSelectModal.question.label + '"') {
                            this.nameSelectModal.updateSkipLogic = true;
                            updateSkipLogic = true;
                            if (doUpdate && selectedNaming)
                                tokens[i] = '"' + selectedNaming + '"';
                        } else if (i % 2 === 0 && token !== this.nameSelectModal.question.label)
                            tokens[i] = '"' + tokens[i] + '"';
                    });
                    if (doUpdate && updateSkipLogic) {
                        fe.skipLogic.condition = tokens.join('');
                        fe.updatedSkipLogic = true;
                    }
                }
            });
        };

        this.nameSelectModal.okSelect = (naming = null) => {
            if (!naming) {
                this.nameSelectModal.question.label = "";
                this.nameSelectModal.question.hideLabel = true;
            }
            else {
                this.nameSelectModal.checkAndUpdateLabel(this.nameSelectModal.section, true, naming.designation);
                this.nameSelectModal.question.label = naming.designation;
                this.nameSelectModal.question.hideLabel = false;
            }
            this.nameSelectModalRef.close();
        };
    }

    ngOnInit() {
        this.question = this.node.data;
        this.parent = this.node.parent.data;
        if (!this.question.instructions)
            this.question.instructions = new FormattedValue;
        if (!this.question.skipLogic)
            this.question.skipLogic = new SkipLogic;
        if (!this.question.question.uoms)
            this.question.question.uoms = [];
    }

    checkAnswers(answers) {
        let newAnswers = (Array.isArray(answers.value) ? answers.value.filter(answer => answer !== "") : []);
        if (!_.isEqual(this.answersSelected, newAnswers)) {
            this.question.question.answers = this.question.question.cde.permissibleValues.filter(a => newAnswers.indexOf(a.permissibleValue) > -1);
            this.answersSelected = this.question.question.answers.map(a => a.permissibleValue);
            this.stageElt.emit();
        }
    }

    checkUom(uoms) {
        let newUoms = (Array.isArray(uoms.value) ? uoms.value.filter(uom => uom !== "") : []);
        if (!_.isEqual(this.question.question.uoms, newUoms)) {
            this.question.question.uoms = newUoms;
            this.stageElt.emit();
        }
    }

    getRepeatLabel(fe) {
        if (!fe.repeat)
            return "";
        if (fe.repeat[0] === "F")
            return "over First Question";
        return parseInt(fe.repeat) + " times";
    }

    getSkipLogicOptions = (text$: Observable<string>) =>
        text$.debounceTime(300).map(term =>
            this.skipLogicService.getCurrentOptions(term, this.parent.formElements, this.question, this.parent.formElements.indexOf(this.question))
        );

    getTemplate() {
        return (this.isAllowedModel.isAllowed(this.elt) && this.question.edit ? this.formDescriptionQuestionEditTmpl : this.formDescriptionQuestionTmpl);
    }

    getAnswersData() {
        return this.question.question.cde.permissibleValues.map(answer => { return {id: answer.permissibleValue, text: answer.valueMeaningName}; });
    }

    getAnswersValue() {
        if (!this.answersSelected)
            this.answersSelected = this.question.question.answers.map(a => a.permissibleValue);
        return this.answersSelected;
    }

    getUoms() {
        return this.question.question.uoms.map(uom => { return {id: uom, text: uom}; });
    }

    isScore(formElt) {
        return formElt.question.cde.derivationRules && formElt.question.cde.derivationRules.length > 0;
    }

    openNameSelect(question, section) {
        this.nameSelectModal.section = section;
        this.nameSelectModal.question = question;
        this.nameSelectModal.cde = question.question.cde;
        let url = "/debytinyid/" + this.nameSelectModal.cde.tinyId;
        if (this.nameSelectModal.cde.version) url += "/" + this.nameSelectModal.cde.version;
        this.http.get(url).map((res: Response) => res.json())
            .subscribe((response) => {
                this.nameSelectModal.cde = response;
            }, () => {
                this.nameSelectModal.cde = "error";
            });
        this.nameSelectModal.checkAndUpdateLabel(section);

        this.nameSelectModalRef = this.modalService.open(this.formDescriptionNameSelectTmpl, {size: "lg"});
        this.nameSelectModalRef.result.then(result => {
            this.stageElt.emit();
        }, () => {
        });
    }

    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.stageElt.emit();
    }

    slOptionsRetrigger() {
        setTimeout(() => {
            this.slInput.nativeElement.dispatchEvent(FormDescriptionQuestionDetailComponent.inputEvent);
        }, 0);
    }

    validateSkipLogic(skipLogic, previousQuestions, item) {
        if (this.skipLogicService.validateSkipLogic(skipLogic, previousQuestions, item))
            this.stageElt.emit();
        else
            this.isFormValid.emit(false);
    }

    static inputEvent = new Event('input');
}