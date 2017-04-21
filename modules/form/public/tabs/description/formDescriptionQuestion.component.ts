import { Component, Inject, Input } from "@angular/core";

@Component({
    selector: "cde-form-description-question",
    templateUrl: "formDescriptionQuestion.component.html"
})
export class FormDescriptionQuestionComponent {
    @Input() parent: any;
    @Input() question: any;
    @Input() canCurate: boolean;
    @Input() inScoreCdes: any;

    constructor() {}

    getDatatypeLabel(question) {
        let datatype = question.question.datatype;
        if (datatype === "Number") {
            return "(Number)";
        } else if (datatype === "Date") {
            return "(Date)";
        } else return "";
    }

}