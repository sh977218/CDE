import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { AlertService } from '_app/alert.service';
import { MyBoardsService } from 'board/public/myBoards.service';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'cde-create-board',
    templateUrl: './createBoard.component.html',
})
export class CreateBoardComponent {
    @Input() set module(module) {
        this._module = module;
        if (this.newBoard) this.newBoard.type = module;
    }

    @ViewChild('createBoardModal') createBoardModal: TemplateRef<any>;
    _module = undefined;
    dialogRef: MatDialogRef<TemplateRef<any>>;
    newBoard: any;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public dialog: MatDialog,
                private myBoardsSvc: MyBoardsService) {
    }

    doCreateBoard() {
        this.newBoard.shareStatus = 'Private';
        this.http.post('/server/board', this.newBoard, {responseType: 'text'}).subscribe(() => {
            this.myBoardsSvc.waitAndReload();
            this.dialogRef.close();
            this.alert.addAlert('success', 'Board created.');
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    openNewBoard() {
        this.newBoard = {
            type: this._module || 'cde'
        };
        this.dialogRef = this.dialog.open(this.createBoardModal, {width: '800px'});
    }
}
