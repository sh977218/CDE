import { Component, Input, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MyBoardsService } from 'board/public/myBoards.service';
import { AlertService } from '_app/alert/alert.service';
import { UserService } from '_app/user.service';

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

    constructor(public myBoardsSvc: MyBoardsService,
                public modalService: NgbModal,
                private alert: AlertService,
                private http: Http,
                private userService: UserService) {
    }

    open() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;

            if (this.userService.user && this.userService.user._id) {
                this.myBoardsSvc.loadMyBoards(this.module);
                this.modalRef = this.modalService.open(this.pinModal);
            } else {
                this.modalService.open(this.ifYouLoginModal);
                this.reject();
            }
        });
    }

    pinMultiple(elts: any, promise: Promise<any>) {
        promise.then(board => {
            let url = "/board/id/" + board._id;
            if (this.module === "cde")
                url += "/dataElements/";
            if (this.module === "form")
                url += "/forms/";

            this.http.put(url, elts).subscribe((r) => {
                this.alert.addAlert(r.status === 200 ? "success" : "warning", r.text());
                this.modalRef.close();
            }, (err) => {
                this.alert.addAlert("danger", err);
            });
        }, () => {
        });
    }

    pinOne(elt: any, promise: Promise<any>) {
        promise.then(board => {
            this.http.put('/pin/' + this.module + '/' + elt.tinyId + '/' + board._id, {}).subscribe((r) => {
                this.alert.addAlert(r.status === 200 ? 'success' : 'warning', r.text());
                this.modalRef.close();
            }, (err) => {
                this.alert.addAlert('danger', err);
            });
        }, () => {
        });
    }

    selectBoard(board) {
        this.resolve(board);
    }
}
