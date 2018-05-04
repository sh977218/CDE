import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { UserService } from '_app/user.service';
import { AlertService } from '_app/alert/alert.service';
import { MyBoardsService } from 'board/public/myBoards.service';


@Component({
    selector: 'cde-my-boards',
    templateUrl: './myBoards.component.html',
    styles: [`
        .my-board-card {
            border: 1px solid #dcdcdc;
            border-radius: 5px;
            margin: 3px;
            padding: 15px;
            min-height: 160px;
            position: relative;
        }
    `]
})
export class MyBoardsComponent implements OnInit {
    showChangeStatus: boolean;
    showDelete: boolean;
    suggestTags = [];

    ngOnInit() {
        this.myBoardsSvc.loadMyBoards();
    }

    constructor(
        private alert: AlertService,
        private http: HttpClient,
        public myBoardsSvc: MyBoardsService,
        public userService: UserService,
    ) {
    }

    cancelSave(board) {
        if (board.editMode) delete board.editMode;
        board.showEdit = false;
    }

    changeStatus(index) {
        let board = this.myBoardsSvc.boards[index];
        if (board.shareStatus === 'Private') {
            board.shareStatus = 'Public';
        } else {
            board.shareStatus = 'Private';
        }
        this.save(board);
        this.showChangeStatus = false;
    }

    getLinkSource(id) {
        return '/board/' + id;
    }

    removeBoard(index) {
        this.showDelete = false;
        this.http.delete('/board/' + this.myBoardsSvc.boards[index]._id, {responseType: 'text'}).subscribe(() => {
            this.alert.addAlert('success', 'Done');
            this.myBoardsSvc.waitAndReload();
        });
    }

    save(board) {
        if (board.editMode) delete board.editMode;
        this.http.post('/board', board, {responseType: 'text'}).subscribe(() => {
            this.alert.addAlert('success', 'Saved.');
            this.myBoardsSvc.waitAndReload();
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    selectAggregation(aggName, $index) {
        this.myBoardsSvc.filter[aggName][$index].checked = !this.myBoardsSvc.filter[aggName][$index].checked;
        this.myBoardsSvc.loadMyBoards();
    }
}
