import { Component, Input, OnInit, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CompareService } from "../core/public/compare.service";

@Component({
    selector: "cde-compare-array",
    templateUrl: "./compareArray.component.html"
})
export class CompareArrayComponent implements OnInit {
    @Input() left;
    @Input() right;
    @Input() option;

    constructor(public compareService: CompareService) {
    }

    ngOnInit(): void {
        if (!this.option) this.option = {};
        this.compareService.doCompareArray(this.left, this.right, this.option)
    }
}
