import { Http } from "@angular/http";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import { Component, Inject, Input, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-cde-summary-list",
    templateUrl: "./cdeSummaryList.component.html",
    providers: [NgbActiveModal]
})

export class CdeSummaryListComponent {

    @Input() public cdes: any[];

    constructor(
    ) {}



}