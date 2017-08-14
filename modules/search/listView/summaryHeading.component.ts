import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: "cde-summary-heading",
    templateUrl: "./summaryHeading.component.html",
})
export class SummaryHeadingComponent {
    @Input() elt: any;
    @Input() eltIndex: number;
    @Input() urlPrefix: string;
    @Output() select = new EventEmitter<string>();

    constructor() {}
}
