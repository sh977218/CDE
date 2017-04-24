import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";

@Component({
    selector: "cde-form-description-section",
    templateUrl: "formDescriptionSection.component.html"
})
export class FormDescriptionSectionComponent implements OnInit {
    @Input() node: any;
    @Input() preId: string;
    @Input() canCurate: boolean;
    @Input() inScoreCdes: any;
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

    constructor() {}

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

    getTemplate() {
        return (this.section.elementType === "section" ? this.formDescriptionSectionTmpl : this.formDescriptionFormTmpl);
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

}
