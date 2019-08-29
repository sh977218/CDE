import { Component, Input } from '@angular/core';

import { NativeRenderService } from 'nativeRender/nativeRender.service';
import { FormElement, FormSectionOrForm } from 'shared/form/form.model';

@Component({
    selector: 'cde-native-section',
    templateUrl: './nativeSection.component.html'
})
export class NativeSectionComponent {
    @Input() formElements!: FormElement[];
    @Input() formElement!: FormSectionOrForm;
    @Input() numSubQuestions!: number;

    constructor(public nrs: NativeRenderService) {
    }

    sectionType() {
        if (this.formElement.repeat && this.formElement.repeat !== '1') { return 'table'; }
        if (this.nrs.profile.sectionsAsMatrix && this.canBeDisplayedAsMatrix(this.formElement)) { return 'matrix'; }
        return 'section';
    }

    isSectionDisplayed(section: FormSectionOrForm) {
        return section.label || section.formElements.some(elem => elem.elementType === 'question');
    }

    canBeDisplayedAsMatrix(section: FormSectionOrForm) {
        if (!section) { return true; }
        let result = true;
        let answerHash: string;

        if (section && section.formElements
            && (section.formElements.length === 0 || section.formElements.length === 1)) {
            return false;
        }

        if (section && section.formElements) {
            section.formElements.forEach((formElem) => {
                if (formElem.elementType !== 'question'
                    || formElem.question.datatype !== 'Value List'
                    || formElem.question.answers.length === 0
                    || !formElem.question.answers[0].valueMeaningName) {
                    result = false;
                    return;
                }
                const newHash = JSON.stringify(formElem.question.answers.map((a) => a.valueMeaningName));
                if (!answerHash) {
                    answerHash = newHash;
                    return;
                }
                if (answerHash !== newHash) {
                    result = false;
                    return;
                }
            });
        }
        if (section.forbidMatrix) { return false; }
        return result;
    }
}
