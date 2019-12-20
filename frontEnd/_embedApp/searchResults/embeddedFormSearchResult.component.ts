import { Component, Input } from '@angular/core';
import { getFormQuestionsAsQuestionCde } from 'core/form/fe';
import { CdeFormElastic } from 'shared/form/form.model';
import { Embed, UserSearchSettings } from 'shared/models.model';

@Component({
    selector: 'cde-embedded-form-search-result',
    templateUrl: 'embeddedFormSearchResult.component.html'
})
export class EmbeddedFormSearchResultComponent {
    @Input() elts!: CdeFormElastic[];
    @Input() embed!: Embed;
    @Input() searchViewSettings!: UserSearchSettings;

    concatenateQuestions(form: CdeFormElastic) {
        return getFormQuestionsAsQuestionCde(form).map(c => c.name).join(',');
    }
}
