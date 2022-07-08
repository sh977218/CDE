import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Board } from 'shared/models.model';
import {
    BoardOverviewEditModalComponent
} from 'board/board-overview/board-overview-edit-modal/board-overview-edit-modal.component';
import {
    BoardOverviewDeleteModalComponent
} from 'board/board-overview/board-overview-delete-modal/board-overview-delete-modal.component';
import { UserService } from '_app/user.service';
import { MyBoardsService } from 'board/myBoards.service';
import { Router } from '@angular/router';
import { AlertService } from 'alert/alert.service';

@Component({
    selector: 'cde-board-overview',
    templateUrl: './board-overview.component.html',
})
export class BoardOverviewComponent implements OnInit {
    @Input() board: any;
    @Output() headerClicked = new EventEmitter();
    boardTitle = 'CDE(s)';
    canEdit = false;

    constructor(public dialog: MatDialog,
                public router: Router,
                public alert: AlertService,
                public userService: UserService,
                public myBoardService: MyBoardsService) {
    }

    ngOnInit(): void {
        if (this.board) {
            this.boardTitle = this.board.type === 'form' ? 'Form(s)' : 'CDE(s)';
            this.canEdit = this.board.owner.username === this.userService.user.username;
        }
    }

    openEditBoardModal() {
        this.dialog.open(BoardOverviewEditModalComponent, {width: '800px', data: this.board})
            .afterClosed()
            .subscribe(board => {
                if (board) {
                    this.myBoardService.saveBoard(board)
                        .subscribe(() => {
                            this.myBoardService.waitAndReload(() => this.alert.addAlert('success', 'Saved.'));
                        }, err => this.alert.httpErrorMessageAlert(err));
                }
            });
    }

    openDeleteBoardModal() {
        this.dialog.open(BoardOverviewDeleteModalComponent, {width: '500px', data: this.board})
            .afterClosed()
            .subscribe(board => {
                if (board) {
                    this.myBoardService.deleteBoard(board).subscribe(() => {
                        this.myBoardService.waitAndReload(() => this.alert.addAlert('success', 'Deleted.'))
                    }, err => this.alert.httpErrorMessageAlert(err));
                }
            });
    }

    clickHeader(board: Board) {
        if (this.headerClicked.observers.length) {
            this.headerClicked.emit(board);
        } else {
            this.router.navigateByUrl(`/board/${board._id}`);
        }
    }
}
