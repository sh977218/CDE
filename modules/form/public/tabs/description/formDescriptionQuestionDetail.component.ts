import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { SkipLogicService } from "../../skipLogic.service";
import { Observable } from "rxjs/Observable";
import * as _ from "lodash";

@Component({
    selector: "cde-form-description-question-detail",
    templateUrl: "formDescriptionQuestionDetail.component.html"
})
export class FormDescriptionQuestionDetailComponent implements OnInit {
    @Input() canCurate: boolean;
    @Input() inScoreCdes: any;
    @Input() node: any;
    @Output() isFormValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild("formDescriptionQuestionTmpl") formDescriptionQuestionTmpl: TemplateRef<any>;
    @ViewChild("formDescriptionQuestionEditTmpl") formDescriptionQuestionEditTmpl: TemplateRef<any>;

    question: any;
    parent: any;
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
    uomOptions: any = {
        multiple: true,
        tags: true,
        language: {
            noResults: () => {
                return "No Units of Measure are listed on the CDE. Type in more followed by ENTER.";
            }
        }
    };
    answersSelected: Array<string>;

    constructor(public skipLogicService: SkipLogicService) {}

    ngOnInit() {
        this.question = this.node.data;
        this.parent = this.node.parent.data;
        if (!this.question.instructions)
            this.question.instructions = {};
        if (!this.question.skipLogic)
            this.question.skipLogic = {};
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

    getRepeatLabel(section) {
        if (!section.repeat)
            return "";
        if (section.repeat[0] === "F")
            return "over First Question";
        return parseInt(section.repeat) + " times";
    }

    getSkipLogicOptions = (text$: Observable<string>) =>
        text$.debounceTime(300).distinctUntilChanged().map(term =>
            this.skipLogicService.getCurrentOptions(term, this.parent.formElements, this.question, this.parent.formElements.indexOf(this.question))
        );

    getTemplate() {
        return (this.canCurate && this.question.edit ? this.formDescriptionQuestionEditTmpl : this.formDescriptionQuestionTmpl);
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
        // $modal.open({
        //     animation: false,
        //     resolve: {
        //         question: function () {
        //             return question;
        //         },
        //         section: function () {
        //             return section;
        //         }
        //     }
        // }).result.then(function () {
        //     this.stageElt.emit();
        // }, function () {
        // });
    }

    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.stageElt.emit();
    }

    validateSkipLogic(skipLogic, previousQuestions, item) {
        if (this.skipLogicService.validateSkipLogic(skipLogic, previousQuestions, item))
            this.stageElt.emit();
        else
            this.isFormValid.emit(false);
    }
}