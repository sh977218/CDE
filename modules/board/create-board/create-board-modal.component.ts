import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { MyBoardsService } from 'board/myBoards.service';

@Component({
    selector: 'cde-create-board-modal',
    templateUrl: './create-board-modal.component.html'
})
export class CreateBoardModalComponent {
    newBoard;
    module = 'cde';

    constructor(private http: HttpClient,
                public dialog: MatDialog,
                private alert: AlertService,
                public dialogRef: MatDialogRef<CreateBoardModalComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private myBoardsSvc: MyBoardsService) {
        this.newBoard = data;
        this.module = data.type;
    }
    doCreateBoard() {
        this.newBoard.shareStatus = 'Private';
        this.http.post('/server/board', this.newBoard, {responseType: 'text'}).subscribe(() => {
            this.dialogRef.close();
            this.myBoardsSvc.waitAndReload(() => {
                this.alert.addAlert('success', 'Board created.');
            });
        }, err => this.alert.httpErrorMessageAlert(err));
    }
}
