import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { MyBoardsService } from 'board/public/myBoards.service';
import { Item, ModuleItem } from 'shared/models.model';

@Component({
    selector: 'cde-create-board',
    templateUrl: './createBoard.component.html',
})
export class CreateBoardComponent {
    @Input() buttonName?: string = 'Add Board';
    @Input() elts: Item[] = [];
    @Input() set module(module: ModuleItem) {
        this._module = module;
        if (this.newBoard) {
            this.newBoard.type = module;
        }
    }
    @ViewChild('createBoardModal') createBoardModal!: TemplateRef<any>;
    _module!: ModuleItem;
    dialogRef!: MatDialogRef<TemplateRef<any>>;
    newBoard: any;

    constructor(private http: HttpClient,
                public dialog: MatDialog,
                public userSvc: UserService,
                private alert: AlertService,
                private myBoardsSvc: MyBoardsService) {
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

    openNewBoard() {
        this.newBoard = {
            type: this._module || 'cde',
            pins: this.elts.map(e => {
                return {
                    tinyId: e.tinyId,
                    name: e.designations[0].designation,
                    type: this._module
                };
            })
        };
        this.dialogRef = this.dialog.open(this.createBoardModal, {width: '800px'});
    }
}
