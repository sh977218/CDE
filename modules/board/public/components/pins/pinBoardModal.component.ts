import { Component, Inject, Input, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'system/public/components/alert/alert.service';
import { MyBoardsService } from 'board/public/myBoards.service';

@Component({
    selector: 'cde-pin-board-modal',
    templateUrl: './pinBoardModal.component.html',
    providers: [NgbActiveModal]
})
export class PinBoardModalComponent {
    @Input() module = null;
    @ViewChild('pinModal') public pinModal: NgbModalModule;
    @ViewChild('ifYouLoginModal') public ifYouLoginModal: NgbModalModule;

    public modalRef: NgbModalRef;
    private resolve;
    private reject;

    constructor(
        public myBoardsSvc: MyBoardsService,
        public modalService: NgbModal,
        private alert: AlertService,
        private http: Http,
        @Inject('userResource') private userService
    ) {}

    open() {
        if (this.userService.user && this.userService.user._id) {
            this.myBoardsSvc.loadMyBoards(this.module);
            this.modalRef = this.modalService.open(this.pinModal);
        } else {
            this.modalService.open(this.ifYouLoginModal);
            this.reject();
        }

        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    selectBoard(board) {
        this.resolve(board);
    }

    pinOne(module: string, elt: any, promise: Promise<any>) {
        promise.then(board => {
            this.http.put('/pin/' + module + '/' + elt.tinyId + '/' + board._id, {}).subscribe((r) => {
                this.alert.addAlert(r.status === 200 ? 'success' : 'warning', r.text());
                this.modalRef.close();
            }, (err) => {
                this.alert.addAlert('danger', err);
            });
        });
    }
}
