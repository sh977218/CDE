import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert.service';
import { UserService } from '_app/user.service';
import { MyBoardsService } from 'board/public/myBoards.service';


@Component({
    selector: 'cde-pin-board-modal',
    templateUrl: './pinBoardModal.component.html',
    providers: [NgbActiveModal]
})
export class PinBoardModalComponent {
    @Input() module = null;
    @ViewChild('pinModal') pinModal: NgbModalModule;
    @ViewChild('ifYouLoginModal') ifYouLoginModal: NgbModalModule;
    modalRef: NgbModalRef;
    private resolve;
    private reject;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public modalService: NgbModal,
                public myBoardsSvc: MyBoardsService,
                private userService: UserService) {
    }


    pinMultiple(elts: any, promise: Promise<any>) {
        promise.then(board => {
            this.http.put('/server/board/pinToBoard/', {
                boardId: board._id,
                tinyIdList: elts.map(e => e.tinyId),
                type: this.module
            }, {observe: 'response', responseType: 'text'}).subscribe(r => {
                if (elts.length === 1) this.alert.addAlert('success', 'Added to Board');
                else this.alert.addAlert('success', 'All elements pinned.');
                this.modalRef.close();
            }, err => this.alert.httpErrorMessageAlert(err));
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    open() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;

            if (this.userService.user) {
                this.myBoardsSvc.loadMyBoards(this.module);
                this.modalRef = this.modalService.open(this.pinModal, {size: 'lg'});
            } else {
                this.modalService.open(this.ifYouLoginModal);
                this.reject();
            }
        });
    }

    selectBoard(board) {
        this.resolve(board);
    }
}
