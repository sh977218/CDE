import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert.service';
import { MyBoardsService } from 'board/public/myBoards.service';


@Component({
    selector: 'cde-create-board',
    templateUrl: './createBoard.component.html',
    providers: [NgbActiveModal]
})
export class CreateBoardComponent {
    @Input() set module(module) {
        this._module = module;
        if (this.newBoard) this.newBoard.type = module;
    }

    @ViewChild('createBoardModal') createBoardModal: NgbModalModule;
    _module = undefined;
    modalRef: NgbModalRef;
    newBoard: any;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public modalService: NgbModal,
                private myBoardsSvc: MyBoardsService) {
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
            type: this._module || 'cde'
        };
        this.modalRef = this.modalService.open(this.createBoardModal, {size: 'lg'});
    }
}
