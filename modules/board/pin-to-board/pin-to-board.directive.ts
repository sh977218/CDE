import { Directive, HostListener, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import { Board, ModuleItem } from 'shared/models.model';
import { AlertService } from 'alert/alert.service';
import { UserService } from '_app/user.service';
import { MyBoardsService } from 'board/myBoards.service';
import {
    PinToBoardLogInModalComponent
} from 'board/pin-to-board/pin-to-board-log-in-modal/pin-to-board-log-in-modal.component';
import { PinBoardSnackbarComponent } from 'board/snackbar/pinBoardSnackbar.component';
import { PinToBoardModalComponent } from 'board/pin-to-board/pin-to-board-modal/pin-to-board-modal.component';

@Directive({
    selector: '[pinToBoard]',
    providers: [MatDialog]
})
export class PinToBoardDirective {
    @Input() module: ModuleItem = 'cde';
    @Input() eltsToPin? = [];
    @Input() width? = '800px';
    @Input() elasticsearchPinQuery?;

    constructor(private http: HttpClient,
                public dialog: MatDialog,
                private alert: AlertService,
                public userService: UserService,
                public myBoardService: MyBoardsService) {
    }


    @HostListener('click') onClick() {
        const module = this.module;
        if (this.userService.user) {
            this.myBoardService.loadMyBoards(module, () => {
                if (this.myBoardService.boards.length === 0) {
                    const newBoardName = `${module === 'cde' ? 'CDE' : 'Form'} Board 1`;
                    const newBoard = {
                        type: module,
                        pins: [],
                        name: newBoardName,
                        description: '',
                        shareStatus: 'Private'
                    };
                    this.http.post<Board>('/server/board', newBoard)
                        .subscribe((board) => {
                            this.myBoardService.addToBoard(board, module, this.eltsToPin)
                                .subscribe(() => {
                                    this.alert.addAlertFromComponent('success', PinBoardSnackbarComponent, {
                                        message: this.eltsToPin.length === 1 ? 'Pinned to ' : 'All elements pinned to ',
                                        boardId: board._id,
                                        boardName: 'New Board'
                                    });
                                }, err => this.alert.httpErrorMessageAlert(err));
                        }, err => this.alert.httpErrorMessageAlert(err));
                } else if (this.myBoardService.boards.length === 1) {
                    const board = this.myBoardService.boards[0];
                    this.myBoardService.addToBoard(board, module, this.eltsToPin)
                        .subscribe(() => {
                            this.alert.addAlertFromComponent('success', PinBoardSnackbarComponent, {
                                message: this.eltsToPin.length === 1 ? 'Pinned to ' : 'All elements pinned to ',
                                boardId: board._id,
                                boardName: board.name
                            });
                        }, err => this.alert.httpErrorMessageAlert(err));
                } else {
                    const data = module;
                    this.dialog.open(PinToBoardModalComponent, {width: this.width, data})
                        .afterClosed()
                        .subscribe(board => {
                            if (board) {
                                if (this.eltsToPin.length) {
                                    this.myBoardService.addToBoard(board, module, this.eltsToPin)
                                        .subscribe(() => {
                                            this.alert.addAlertFromComponent('success', PinBoardSnackbarComponent, {
                                                message: this.eltsToPin.length === 1 ? 'Pinned to ' : 'All elements pinned to ',
                                                boardId: board._id,
                                                boardName: board.name
                                            });
                                        }, err => this.alert.httpErrorMessageAlert(err));
                                } else if (this.elasticsearchPinQuery) {
                                    this.myBoardService.addAllToBoard(board, module, this.elasticsearchPinQuery);
                                }
                            }
                        })
                }
            })
        } else {
            this.dialog.open(PinToBoardLogInModalComponent, {width: '800px'})
        }
    }

}