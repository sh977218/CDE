import { Component, Input, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { Router } from '@angular/router';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import "rxjs/add/operator/map";

import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: "cde-mlt",
    templateUrl: "moreLikeThis.component.html",
    providers: [NgbActiveModal]
})

export class MoreLikeThisComponent {

    @ViewChild("mltModal") public mltModal: NgbModalModule;
    @ViewChild("mltPinModal") public mltPinModal: PinBoardModalComponent;
    @Input() elt: any;

    public modalRef: NgbModalRef;
    cdes: any[];

    constructor(private http: Http,
                private router: Router,
                private alert: AlertService,
                public modalService: NgbModal,
                public quickBoardService: QuickBoardListService) {
    }

    open() {
        this.http.get("/moreLikeCde/" + this.elt.tinyId)
            .map(res => res.json()).subscribe(response => {
            this.cdes = response.cdes;
        }, () => this.alert.addAlert("error", "Unable to retrieve MLT"));
        this.modalRef = this.modalService.open(this.mltModal, {size: "lg"});
    }

    viewDe(cde) {
        this.modalRef.close();
        this.router.navigate(['/deView'], {queryParams: {tinyId: cde.tinyId}});
    };
}