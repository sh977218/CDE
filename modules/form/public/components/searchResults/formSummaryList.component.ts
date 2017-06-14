import { Component, Input } from "@angular/core";
import { CdeForm } from "../../form.model";
import { FormSummaryListContentComponent } from "./formSummaryListContent.component";

@Component({
    selector: "cde-form-summary-list",
    templateUrl: "./formSummaryList.component.html",
})
export class FormSummaryListComponent {
    @Input() forms: CdeForm[];

    summaryComponent: any = FormSummaryListContentComponent;

    constructor() {}
}
