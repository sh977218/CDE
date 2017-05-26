import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { Http } from '@angular/http';

import "rxjs/add/operator/map";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CompareService } from "../core/public/compare.service";
import * as _ from "lodash";
@Component({
    selector: "cde-compare-side-by-side",
    templateUrl: "./compareSideBySide.component.html",
    providers: [NgbActiveModal]
})
export class CompareSideBySideComponent implements OnInit {
    @ViewChild("compareSideBySideContent") compareSideBySideContent: NgbModal;
    public modalRef: NgbModalRef;

    @Input() left;
    @Input() right;
    @Input() options;
    public result;

    constructor(public modalService: NgbModal,
                public compareService: CompareService) {
    }

    ngOnInit(): void {
        if (!this.options) this.options = {};
    }

    openModal() {
        this.result = this.compareService.doCompare(this.left, this.right, this.options);
        this.modalRef = this.modalService.open(this.compareSideBySideContent, {size: "lg"});
    }

}
