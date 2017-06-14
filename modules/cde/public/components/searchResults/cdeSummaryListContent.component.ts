import { Component, Input } from "@angular/core";
import { SummaryComponent } from "search";


@Component({
    selector: "cde-cde-summary-list-content",
    templateUrl: "./cdeSummaryListContent.component.html",
})
export class CdeSummaryListContentComponent implements SummaryComponent {
    @Input() elt: any;
    @Input() eltIndex: any;

    defaultAttachmentsFilter = a => a.isDefault === true;
    module = 'cde';

    constructor() {}
}
