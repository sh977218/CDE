import { Component, Input } from "@angular/core";

@Component({
    selector: "cde-summary-list",
    templateUrl: "./summaryList.component.html",
})
export class SummaryListComponent {
    @Input() summaryComponent: any;
    @Input() elts: any[];

    trackByElt(index: number, elt: any): number { return elt.tinyId; }

    constructor() {}
}
