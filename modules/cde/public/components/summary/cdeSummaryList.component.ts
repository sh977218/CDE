import { Component, Input } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-cde-summary-list",
    templateUrl: "./cdeSummaryList.component.html",
    providers: []
})

export class CdeSummaryListComponent {

    @Input() public cdes: any[];

    constructor(
    ) {}

}