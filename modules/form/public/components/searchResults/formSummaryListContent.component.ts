import { Component, Input } from "@angular/core";
import { SummaryComponent } from "search";


@Component({
    selector: "cde-form-summary-list-content",
    templateUrl: "./formSummaryListContent.component.html",
})
export class FormSummaryListContentComponent implements SummaryComponent {
    @Input() elt: any;
    @Input() eltIndex: any;

    defaultAttachmentsFilter = a => a.isDefault === true;
    module = 'form';

    constructor() {}

    getStewards() {
        return this.elt.classification.map(cl => cl.stewardOrg.name).join(' ');
    }
}
