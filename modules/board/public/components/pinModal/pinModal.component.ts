import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Component, Inject, Input, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { MyBoardsService } from "../../myBoards.service";
import { Http } from "@angular/http";

@Component({
    selector: "cde-pin-modal",
    templateUrl: "pinModal.component.html",
    providers: [NgbActiveModal]
})

export class PinModalComponent {

    @ViewChild("pinModal") public pinModal: NgbModalModule;
    @ViewChild("ifYouLoginModal") public ifYouLoginModal: NgbModalModule;

    public modalRef: NgbModalRef;
    private elt: any;
    private type: String;

    constructor(
        private myBoardsSvc: MyBoardsService,
        public modalService: NgbModal,
        @Inject("Alert") private alert,
        private http: Http,
        @Inject("userResource") private userService
    ) {}

    open (elt, type) {
        this.elt = elt;
        this.type = type;
        if (this.userService.user && this.userService.user._id) {
            this.myBoardsSvc.loadMyBoards();
            this.modalRef = this.modalService.open(this.pinModal, {size: "lg"});
        } else {
            this.modalService.open(this.ifYouLoginModal, {});
        }
    }

    selectBoard (board) {
        this.http.put("/pin/" + this.type + "/" + this.elt.tinyId + "/" + board._id, {}).subscribe((r) => {
            this.alert.addAlert(r.status === 200 ? "success" : "warning", r.text());
            this.modalRef.close();
        }, (err) => {
            this.alert.addAlert("danger", err);
        });
    }

}