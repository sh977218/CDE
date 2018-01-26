import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert/alert.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';


@Component({
    selector: 'cde-mlt',
    templateUrl: 'moreLikeThis.component.html',
    providers: [NgbActiveModal]
})
export class MoreLikeThisComponent {
    @Input() elt: any;
    @ViewChild('mltModal') public mltModal: NgbModalModule;
    @ViewChild('mltPinModal') public mltPinModal: PinBoardModalComponent;
    cdes: any[];
    modalRef: NgbModalRef;

    constructor(
        private http: HttpClient,
        private router: Router,
        private alert: AlertService,
        public modalService: NgbModal,
        public quickBoardService: QuickBoardListService
    ) {
    }

    open() {
        this.http.get<any>('/moreLikeCde/' + this.elt.tinyId).subscribe(response => {
            this.cdes = response.cdes;
        }, () => this.alert.addAlert('error', 'Unable to retrieve MLT'));
        this.modalRef = this.modalService.open(this.mltModal, {size: 'lg'});
    }
}
