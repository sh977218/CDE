import { Http } from "@angular/http";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import { Component, Inject, Input, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-pin-modal",
    templateUrl: "pinModal.component.html",
    providers: [NgbActiveModal]
})

export class PinModalComponent {

    @ViewChild("pinModal") public pinModal: NgbModalModule;

    public modalRef: NgbModalRef;

    constructor(
        @Inject("MyBoardsService") private myBoardsSvc,
        public modalService: NgbModal
    ) {}

    open () {
        this.modalRef = this.modalService.open(this.pinModal, {size: "lg"});
    }


}