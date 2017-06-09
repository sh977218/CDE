import { Http } from "@angular/http";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Component, Inject, Input, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { PinModalComponent } from "../../../../board/public/components/pinModal/pinModal.component";
import { AlertService } from "../../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-mlt",
    templateUrl: "moreLikeThis.component.html",
    providers: [NgbActiveModal]
})

export class MoreLikeThisComponent {

    @ViewChild("mltModal") public mltModal: NgbModalModule;
    @ViewChild("mltPinModal") public mltPinModal: PinModalComponent;
    @Input() elt: any;

    public modalRef: NgbModalRef;
    cdes: any[];

    constructor(private http: Http,
                private alert: AlertService,
                public modalService: NgbModal,
                @Inject("QuickBoard") public quickBoard) {
    }

    open () {
        //noinspection TypeScriptValidateTypes
        this.http.get("/moreLikeCde/" + this.elt.tinyId).map(res => res.json()).subscribe(response => {
            this.cdes = response.cdes;
        }, () => {
            this.alert.addAlert("error", "Unable to retrieve MLT");
        });

        this.modalRef = this.modalService.open(this.mltModal, {size: "lg"});
    }

    static view (cde) {
        window.open("deview?tinyId=" + cde.tinyId);
    };


}