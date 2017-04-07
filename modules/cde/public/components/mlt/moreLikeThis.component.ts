import { Http } from "@angular/http";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";
import { Component, Inject, Input, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { PinModalComponent } from "../../../../board/public/components/pinModal/pinModal.component";

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
    private cdes: any[];

    constructor(private http: Http,
        @Inject("Alert") private alert,
        public modalService: NgbModal,
        @Inject("QuickBoard") private quickBoard,
    ) {}

    open () {
        this.http.get("/moreLikeCde/" + this.elt.tinyId).map(res => res.json()).subscribe(response => {
            this.cdes = response.cdes;
        }, () => {
            this.alert.addAlert("error", "Unable to retrieve MLT");
        });

        this.modalRef = this.modalService.open(this.mltModal, {size: "lg"});
    }

    static view (cde, event) {
        window.open("deview?tinyId=" + cde.tinyId);
    };


}