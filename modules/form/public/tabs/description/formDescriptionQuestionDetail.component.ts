import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";

@Component({
    selector: "cde-form-description-question-detail",
    templateUrl: "formDescriptionQuestionDetail.component.html"
})
export class FormDescriptionQuestionDetailComponent implements OnInit {
    @Input() node: any;
    @Input() canCurate: boolean;
    @Input() inScoreCdes: any;
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild("formDescriptionQuestionTmpl") formDescriptionQuestionTmpl: TemplateRef<any>;
    @ViewChild("formDescriptionQuestionEditTmpl") formDescriptionQuestionEditTmpl: TemplateRef<any>;

    question: any;
    parent: any;

    constructor() {}

    ngOnInit() {
        this.question = this.node.data;
        this.parent = this.node.parent.data;
    }

    getTemplate() {
        return (this.canCurate && this.question.edit ? this.formDescriptionQuestionEditTmpl : this.formDescriptionQuestionTmpl);
    }

    canAddUom(question) {
        return this.canCurate && (!question.question.uoms || question.question.uoms.indexOf("Please specify") < 0);
    }

    getRepeatLabel(section) {
        if (!section.repeat)
            return "";
        if (section.repeat[0] === "F")
            return "over First Question";
        return parseInt(section.repeat) + " times";
    }

    isScore(formElt) {
        return formElt.question.cde.derivationRules && formElt.question.cde.derivationRules.length > 0;
    }

    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.stageElt.emit();
    }
}