import { Component, Input, OnInit, Output, ViewChild, ViewContainerRef } from "@angular/core";
import { NativeRenderService } from "./nativeRender.service";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
    selector: "cde-native-question",
    templateUrl: "./nativeQuestion.component.html"
})
export class NativeQuestionComponent {
    @Input() formElement: any;
    @Input() numSubQuestions: number;
    @Input() parentValue: any;
    @Input() index: any;

    // generatedHtml: SafeHtml = "";  // template: `<div #rendered_question></div>`
    // @ViewChild("rendered_question", {read: ViewContainerRef}) templateRef: ViewContainerRef;

    constructor(private sanitizer: DomSanitizer,
                public nativeRenderService: NativeRenderService) {
    }

    classColumns(pvIndex, index) {
        let result = "";

        if (pvIndex !== -1 && this.nativeRenderService.profile && this.nativeRenderService.profile.numberOfColumns) {
            switch (this.nativeRenderService.profile.numberOfColumns) {
                case 2:
                    result = "col-sm-6";
                    break;
                case 3:
                    result = "col-sm-4";
                    break;
                case 4:
                    result = "col-sm-3";
                    break;
                case 5:
                    result = "col-sm-2-4";
                    break;
                case 6:
                    result = "col-sm-2";
                    break;
                default:
            }
        }

        if (this.isFirstInRow(pvIndex !== undefined ? pvIndex : index))
            result += " clear";
        return result;
    }

    isFirstInRow(index) {
        if (this.nativeRenderService.profile && this.nativeRenderService.profile.numberOfColumns > 0)
            return index % this.nativeRenderService.profile.numberOfColumns === 0;
        else
            return index % 4 === 0;
    }

    getLabel(pv) {
        return pv ? (pv.valueMeaningName ? pv.valueMeaningName : pv.permissibleValue) : "";
    }

    getValue(pv) {
        return (pv && pv.permissibleValue !== pv.valueMeaningName ? pv.permissibleValue : "");
    }

    hasLabel(question) {
        return question.label && !question.hideLabel;
    }

    isOneLiner(question, numSubQuestions) {
        return numSubQuestions && !this.hasLabel(question) &&
            question.question.datatype !== "Value List";
    }
}
