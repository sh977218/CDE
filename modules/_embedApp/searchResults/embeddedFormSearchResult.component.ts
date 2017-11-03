import { Component, Input } from '@angular/core';
import * as formShared from "form/shared/formShared";

@Component({
    selector: "cde-embedded-form-search-result",
    templateUrl: "embeddedFormSearchResult.component.html"
})
export class EmbeddedFormSearchResultComponent {

    @Input() elts;
    @Input() searchViewSettings;

    concatenateQuestions (form) {
        return formShared.getFormCdes(form).map(c => c.name).join(",");
    };

}