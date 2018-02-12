import { Component, Input } from '@angular/core';

import { getFormCdes } from 'shared/form/formShared';

@Component({
    selector: "cde-embedded-form-search-result",
    templateUrl: "embeddedFormSearchResult.component.html"
})
export class EmbeddedFormSearchResultComponent {

    @Input() elts;
    @Input() searchViewSettings;
    @Input() embed;

    concatenateQuestions (form) {
        return getFormCdes(form).map(c => c.name).join(",");
    }

}
