import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert/alert.service';
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

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public modalService: NgbModal,
        public myBoardsSvc: MyBoardsService,
        private userService: UserService,
    ) {
    }

    pinMultiple(elts: any, promise: Promise<any>) {
        promise.then(board => {
            let url = '/board/id/' + board._id;
            if (this.module === 'cde') {
                url += '/dataElements/';
            }
            if (this.module === 'form') {
                url += '/forms/';
            }

            this.http.put(url, elts, {observe: 'response', responseType: 'text'}).subscribe(r => {
                this.alert.addAlert(r.status === 200 ? 'success' : 'warning', r.body);
                this.modalRef.close();
            }, err => this.alert.httpErrorMessageAlert(err));
        }, () => {
        });
    }

    pinOne(elt: any, promise: Promise<any>) {
        promise.then(board => {
            let url = '/pin/' + this.module + '/' + elt.tinyId + '/' + board._id;
            this.http.put(url, {}, {observe: 'response', responseType: 'text'}).subscribe(r => {
                this.alert.addAlert(r.status === 200 ? 'success' : 'warning', r.body);
                this.modalRef.close();
            }, err => this.alert.httpErrorMessageAlert(err));
        }, () => {
        });
    }

    open() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;

            if (this.userService.user) {
                this.myBoardsSvc.loadMyBoards(this.module);
                this.modalRef = this.modalService.open(this.pinModal);
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
