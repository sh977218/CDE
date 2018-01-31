import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert/alert.service';
import { MyBoardsService } from 'board/public/myBoards.service';


@Component({
    selector: 'cde-create-board',
    templateUrl: './createBoard.component.html',
    providers: [NgbActiveModal]
})
export class CreateBoardComponent {
    @ViewChild('createBoardModal') public createBoardModal: NgbModalModule;
    public modalRef: NgbModalRef;
    newBoard: any = {
        type: 'cde'
    };

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public modalService: NgbModal,
        private myBoardsSvc: MyBoardsService
    ) {
    }

    doCreateBoard() {
        this.newBoard.shareStatus = 'Private';
        this.http.post('/board', this.newBoard, {responseType: 'text'}).subscribe(() => {
            this.myBoardsSvc.waitAndReload();
            this.modalRef.close();
            this.alert.addAlert('success', 'Board created.');
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    openNewBoard() {
        this.newBoard = {
            type: 'cde'
        };
        this.modalRef = this.modalService.open(this.createBoardModal, {size: 'lg'});
    }
}
