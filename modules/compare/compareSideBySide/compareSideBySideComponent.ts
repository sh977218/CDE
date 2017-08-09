import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "cde-compare-side-by-side",
    templateUrl: "compareSideBySide.component.html"
})
export class CompareSideBySideComponent implements OnInit {
    @ViewChild("compareSideBySideContent") public compareSideBySideContent: NgbModalModule;
    public modalRef: NgbModalRef;
    @Input() left;
    @Input() right;

    constructor(public modalService: NgbModal) {
    }

    ngOnInit(): void {
    }

    doCompare() {
        this.modalRef = this.modalService.open(this.compareSideBySideContent, {size: "lg"});
    }

}