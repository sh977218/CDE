import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert.service';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { PinBoardModalComponent } from 'board/public/components/pins/pinBoardModal.component';
import { MatDialog } from '@angular/material';


@Component({
    selector: 'cde-mlt',
    templateUrl: 'moreLikeThis.component.html',
})
export class MoreLikeThisComponent {
    @Input() elt: any;
    @ViewChild('mltModal') public mltModal: TemplateRef<any>;
    @ViewChild('mltPinModal') public mltPinModal: PinBoardModalComponent;
    cdes: any[];

    constructor(
        private http: HttpClient,
        private router: Router,
        private alert: AlertService,
        public modalService: NgbModal,
        private dialog: MatDialog,
        public quickBoardService: QuickBoardListService
    ) {}

    open() {
        this.http.get<any>('/moreLikeCde/' + this.elt.tinyId).subscribe(response => {
            this.cdes = response.cdes;
        }, () => this.alert.addAlert('error', 'Unable to retrieve MLT'));
        this.dialog.open(this.mltModal, {width: '1000px'});
    }
}
