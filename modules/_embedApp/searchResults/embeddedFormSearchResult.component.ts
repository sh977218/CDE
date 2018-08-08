import { Component, Input } from '@angular/core';

import { getFormQuestionsAsQuestionCde } from 'shared/form/formShared';

@Component({
    selector: "cde-embedded-form-search-result",
    templateUrl: "embeddedFormSearchResult.component.html"
})
export class EmbeddedFormSearchResultComponent {
    @Input() elts;
    @Input() searchViewSettings;
    @Input() embed;

    concatenateQuestions(form) {
        return getFormQuestionsAsQuestionCde(form).map(c => c.name).join(",");
    }
}
