import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { SkipLogicService } from "../../skipLogic.service";
import { Observable } from "rxjs/Observable";

@Component({
    selector: "cde-form-description-section",
    templateUrl: "formDescriptionSection.component.html"
})
export class FormDescriptionSectionComponent implements OnInit {
    @Input() canCurate: boolean;
    @Input() inScoreCdes: any;
    @Input() node: any;
    @Input() preId: string;
    @Output() isFormValid: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild("formDescriptionSectionTmpl") formDescriptionSectionTmpl: TemplateRef<any>;
    @ViewChild("formDescriptionFormTmpl") formDescriptionFormTmpl: TemplateRef<any>;

    parent: any;
    section: any;
    repeatOptions = [
        {label: "", value: ""},
        {label: "Set Number of Times", value: "N"},
        {label: "Over first question", value: "F"}
    ];

    constructor(public skipLogicService: SkipLogicService) {}

    ngOnInit() {
        this.section = this.node.data;
        this.parent = this.node.parent.data;
        this.section.repeatOption = this.getRepeatOption(this.section);
        this.section.repeatNumber = this.getRepeatNumber(this.section);
        if (!this.section.instructions)
            this.section.instructions = {};
        if (!this.section.skipLogic)
            this.section.skipLogic = {};
    }

    removeNode(node) {
        node.parent.data.formElements.splice(node.parent.data.formElements.indexOf(node.data), 1);
        node.treeModel.update();
        this.stageElt.emit();
    }

    getRepeatOption(section) {
        if (!section.repeat)
            return "";
        if (section.repeat[0] === "F")
            return "F";
        else
            return "N";
    }

    getRepeatNumber(section) {
        return parseInt(section.repeat);
    }

    getSkipLogicOptions = (text$: Observable<string>) =>
        text$.debounceTime(300).distinctUntilChanged().map(term =>
            this.skipLogicService.getCurrentOptions(term, this.parent.formElements, this.section, this.parent.formElements.indexOf(this.section))
        );

    getTemplate() {
        return (this.section.elementType === "section" ? this.formDescriptionSectionTmpl : this.formDescriptionFormTmpl);
    }

    setRepeat(section) {
        if (section.repeatOption === "F")
            section.repeat = "First Question";
        else if (section.repeatOption === "N")
            section.repeat = (section.repeatNumber && section.repeatNumber > 1 ? section.repeatNumber.toString() : undefined);
        else
            section.repeat = undefined;
    }

    getRepeatLabel(section) {
        if (!section.repeat)
            return "";
        if (section.repeat[0] === "F")
            return "over First Question";
        return parseInt(section.repeat) + " times";
    }

    validateSkipLogic(skipLogic, previousQuestions, item) {
        if (this.skipLogicService.validateSkipLogic(skipLogic, previousQuestions, item))
            this.stageElt.emit();
        else
            this.isFormValid.emit(false);
    }
}
