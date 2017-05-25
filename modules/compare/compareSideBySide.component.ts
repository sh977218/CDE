import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { Http } from '@angular/http';

import "rxjs/add/operator/map";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-compare-side-by-side",
    templateUrl: "./compareSideBySide.component.html",
    providers: [NgbActiveModal]
})
export class CompareSideBySideComponent implements OnInit {

    @ViewChild("compareSideBySideModel") compareSideBySideModel: NgbModal;
    public modalRef: NgbModalRef;

    constructor(public modalService: NgbModal,
                @Inject("Alert") private alert,
                private http: Http,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    ngOnInit(): void {
    }

    openModal() {
        this.modalRef = this.modalService.open(this.compareSideBySideModel);
    }
}
