import { Component, Input } from "@angular/core";

@Component({
    selector: "cde-form-description-section",
    templateUrl: "formDescriptionSection.component.html"
})
export class FormDescriptionSectionComponent {
    @Input() parent: any;
    @Input() section: any;
    @Input() preId: string;
    @Input() canCurate: boolean;
    @Input() inScoreCdes: any;
    @Output() stageElt: EventEmitter<void> = new EventEmitter<void>();

    repeatOptions = [
        {label: "", value: ""},
        {label: "Set Number of Times", value: "N"},
        {label: "Over first question", value: "F"}
    ];

    constructor() {
        this.section.repeatOption = this.getRepeatOption(this.section);
        this.section.repeatNumber = this.getRepeatNumber(this.section);
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
