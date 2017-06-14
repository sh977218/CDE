import { Component, Input } from "@angular/core";

@Component({
    selector: "cde-summary-heading",
    templateUrl: "./summaryHeading.component.html",
})
export class SummaryHeadingComponent {
    @Input() elt: any;
    @Input() eltIndex: number;
    @Input() urlPrefix: string;

    constructor() {}
}
