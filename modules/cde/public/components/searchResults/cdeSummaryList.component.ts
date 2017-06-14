import { Component, Input } from "@angular/core";
import { CdeSummaryListContentComponent } from "./cdeSummaryListContent.component";

@Component({
    selector: "cde-cde-summary-list",
    templateUrl: "./cdeSummaryList.component.html",
})
export class CdeSummaryListComponent {
    @Input() cdes: any[];

    summaryComponent: any = CdeSummaryListContentComponent;

    constructor() {}
}
