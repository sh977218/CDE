import { Component, Input, OnInit, Output } from "@angular/core";
import { NativeRenderService } from "./nativeRender.service";

@Component({
    selector: "cde-native-section",
    templateUrl: "./nativeSection.component.html"
})
export class NativeSectionComponent {
    @Input() formElements: any;
    @Input() formElement: any;
    @Input() numSubQuestions: number;

    constructor(public nativeRenderService: NativeRenderService) {
    }

    sectionType() {
        if (this.formElement.cardinality && this.formElement.cardinality.max === -1)
            return "table";
        if (this.nativeRenderService.profile.sectionsAsMatrix && this.canBeDisplayedAsMatrix(this.formElement))
            return "matrix";
        return "section";
    }

    isSectionDisplayed(section) {
        return section.label ||
            section.formElements.some(function (elem) {
                return elem.elementType === "question";
            });
    }

    canBeDisplayedAsMatrix(section) {
        if (!section) return true;
        let result = true;
        let answerHash;

        if (section && section.formElements && section.formElements.length === 0)
            return false;
        section && section.formElements && section.formElements.forEach(function (formElem) {
            if (formElem.elementType !== "question") {
                return result = false;
            } else {
                if (formElem.question.datatype !== "Value List") {
                    return result = false;
                }
                if (formElem.question.answers.length === 0 || !formElem.question.answers[0].valueMeaningName)
                    return result = false;
                if (!answerHash) {
                    answerHash = JSON.stringify(formElem.question.answers.map(function (a) {
                        return a.valueMeaningName;
                    }));
                }
                if (answerHash !== JSON.stringify(formElem.question.answers.map(function (a) {
                        return a.valueMeaningName;
                    }))) {
                    return result = false;
                }
            }
        });
        if (section.forbidMatrix)
            return false;
        return result;
    }

    addSection(section, formElements, index) {
        let newElt = JSON.parse(JSON.stringify(section));
        newElt.isCopy = true;
        this.removeAnswers(newElt);
        formElements.splice(index + 1, 0, newElt);
    }

    removeSection(index) {
        this.nativeRenderService.elt.formElements.splice(index, 1);
    }

    canRepeat(formElt) {
        return formElt.cardinality === {min: 0, max: -1} || formElt.cardinality === {min: 1, max: -1};
    }

    removeAnswers(formElt) {
        if (formElt.question) delete formElt.question.answer;
        formElt.formElements.forEach(function (fe) {
            this.removeAnswers(fe);
        });
    }
}
