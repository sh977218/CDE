import { Component, Input, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CompareService } from "../core/public/compare.service";

@Component({
    selector: "cde-compare-object",
    templateUrl: "./compareObject.component.html",
    providers: [NgbActiveModal]
})
export class CompareObjectComponent implements OnInit {
    @Input() left;
    @Input() right;
    @Input() option;
    public result;

    constructor(public compareService: CompareService) {
    }

    ngOnInit(): void {
        if (!this.option) this.option = {};
    }

    openModal() {
        this.result = this.compareService.doCompareObject(this.left, this.right, this.option);
    }

}
