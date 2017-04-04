import { Component, Input, ViewChild } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-datasets",
    templateUrl: "./datasets.component.html"
})

export class DatasetsComponent {
    @ViewChild("datasetsContent") public datasetsContent: NgbModalModule;
    @Input() public elt: any;
    public modalRef: NgbModalRef;

    constructor(public modalService: NgbModal,
                public activeModal: NgbActiveModal) {

    }

    openDatasetsModal() {
        this.modalRef = this.modalService.open(this.datasetsContent, {size: "lg"});
    }
}