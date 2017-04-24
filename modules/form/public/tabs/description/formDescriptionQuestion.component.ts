import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
    selector: "cde-form-description-question",
    templateUrl: "formDescriptionQuestion.component.html"
})
export class FormDescriptionQuestionComponent implements OnInit {
    @Input() node: any;
    @Input() canCurate: boolean;
    @Input() inScoreCdes: any;
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();

    question: any;
    parent: any;

    constructor() {}

    ngOnInit() {
        this.question = this.node.data;
        this.parent = this.node.parent.data;
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
}