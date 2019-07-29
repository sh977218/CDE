import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { MyBoardsService } from 'board/public/myBoards.service';
import { MatDialog, MatDialogRef } from '@angular/material';


@Component({
    selector: 'cde-pin-board-modal',
    templateUrl: './pinBoardModal.component.html',
})
export class PinBoardModalComponent {
    @Input() module = null;
    @ViewChild('pinModal') pinModal: TemplateRef<any>;
    @ViewChild('ifYouLoginModal') ifYouLoginModal: TemplateRef<any>;
    dialogRef: MatDialogRef<TemplateRef<any>>;
    private resolve;
    private reject;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public dialog: MatDialog,
                public myBoardsSvc: MyBoardsService,
                private userService: UserService) {
    }


    pinMultiple(elts: any, promise: Promise<any>) {
        promise.then(board => {
            this.http.put('/server/board/pinToBoard/', {
                boardId: board._id,
                tinyIdList: elts.map(e => e.tinyId),
                type: this.module
            }, {observe: 'response', responseType: 'text'}).subscribe(() => {
                if (elts.length === 1) {
                    this.alert.addAlert('success', 'Added to Board');
                } else { this.alert.addAlert('success', 'All elements pinned.'); }
                this.dialogRef.close();
            }, err => this.alert.httpErrorMessageAlert(err));
        }, err => {
            if (err) { this.alert.httpErrorMessageAlert(err); }
        });
    }

    open() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;

            if (this.userService.user) {
                this.myBoardsSvc.loadMyBoards(this.module);
                this.dialogRef = this.dialog.open(this.pinModal, {width: '800px'});
            } else {
                this.dialog.open(this.ifYouLoginModal);
                this.reject();
            }
        });
    }

    selectBoard(board) {
        this.resolve(board);
        this.dialogRef.close();
    }
}
