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

    @ViewChild("pinModal") public pinModal: ModalDirective;


    constructor(
        @Inject("MyBoardsService") private myBoardsSvc,
    ) {}




}