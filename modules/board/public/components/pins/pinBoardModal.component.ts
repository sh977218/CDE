import { HttpClient } from '@angular/common/http';
import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { MyBoardsService } from 'board/public/myBoards.service';
import { Board, Cb1, ModuleItem } from 'shared/models.model';


@Component({
    selector: 'cde-pin-board-modal',
    templateUrl: './pinBoardModal.component.html',
})
export class PinBoardModalComponent {
    @Input() module!: ModuleItem;
    @ViewChild('pinModal', {static: true}) pinModal!: TemplateRef<any>;
    @ViewChild('ifYouLoginModal', {static: true}) ifYouLoginModal!: TemplateRef<any>;
    dialogRef!: MatDialogRef<TemplateRef<any>>;
    private resolve!: Cb1<Board>;
    private reject!: Cb1<any>;

    constructor(private alert: AlertService,
                private http: HttpClient,
                public dialog: MatDialog,
                public myBoardsSvc: MyBoardsService,
                private userService: UserService) {
    }

    pinMultiple(elts: {tinyId: string}[]){
        if (this.userService.user) {
            this.myBoardsSvc.loadMyBoards(this.module, ()=> {
                if(this.myBoardsSvc.boards && this.myBoardsSvc.boards.length === 0){
                    const newBoardName = `${this.module === 'cde' ? 'CDE' : 'Form'} Board 1`;
                    const newBoard = {
                        type:this.module,
                        pins:[],
                        name:newBoardName,
                        description:'',
                        shareStatus:'Private'
                    };
                    this.http.post('/server/board', newBoard, {responseType: 'text'}).subscribe(() => {
                        this.myBoardsSvc.loadMyBoards(this.module,() => {
                            const board = this.myBoardsSvc.boards?.[0];
                            this.http.put('/server/board/pinToBoard/', {
                                boardId: board._id,
                                tinyIdList: elts.map(e => e.tinyId),
                                type: this.module
                            }).subscribe(() => {
                                if (elts.length === 1) {
                                    this.alert.addAlert('success', 'Added to new board: ' + newBoardName);
                                } else { this.alert.addAlert('success', 'All elements pinned to new board: ' + newBoardName); }
                            }, err => this.alert.httpErrorMessageAlert(err));
                        });
                    }, err => this.alert.httpErrorMessageAlert(err));
                }
                else if(this.myBoardsSvc.boards && this.myBoardsSvc.boards.length === 1){
                    const board = this.myBoardsSvc.boards?.[0];
                    this.http.put('/server/board/pinToBoard/', {
                        boardId: board._id,
                        tinyIdList: elts.map(e => e.tinyId),
                        type: this.module
                    }).subscribe(() => {
                        if (elts.length === 1) {
                            this.alert.addAlert('success', 'Added to ' + board.name);
                        } else { this.alert.addAlert('success', 'All elements pinned to ' + board.name); }
                    }, err => this.alert.httpErrorMessageAlert(err));
                }
                else{
                    this.open().then((board: any) => {
                        this.http.put('/server/board/pinToBoard/', {
                            boardId: board._id,
                            tinyIdList: elts.map(e => e.tinyId),
                            type: this.module
                        }).subscribe(() => {
                            if (this.userService.user) {
                                const body = this.module === 'cde' ? {cdeDefaultBoard: board._id} : {formDefaultBoard: board._id}
                                this.http.post('/server/user/', body).subscribe(() => this.userService.reload());
                            }
                            if (elts.length === 1) {
                                this.alert.addAlert('success', 'Added to Board');
                            } else { this.alert.addAlert('success', 'All elements pinned.'); }
                            this.dialogRef.close();
                        }, err => this.alert.httpErrorMessageAlert(err));
                    }, err => {
                        if (err) { this.alert.httpErrorMessageAlert(err); }
                    });
                }
            });
        } else {
            this.dialog.open(this.ifYouLoginModal);
        }
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
                this.reject('');
            }
        });
    }

    selectBoard(board: Board) {
        this.resolve(board);
        this.dialogRef.close();
    }
}
