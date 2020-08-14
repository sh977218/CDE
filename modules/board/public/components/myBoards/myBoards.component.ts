import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { MyBoardsService } from 'board/public/myBoards.service';
import { Board } from 'shared/models.model';

@Component({
    templateUrl: './myBoards.component.html'
})
export class MyBoardsComponent {
    constructor(private alert: AlertService,
                private http: HttpClient,
                public myBoardsSvc: MyBoardsService,
                public userService: UserService) {
        this.myBoardsSvc.loadMyBoards();
    }

    saveBoard(board: Board) {
        this.http.post('/server/board/', board, {responseType: 'text'}).subscribe(() => {
            this.myBoardsSvc.waitAndReload(() => {
                this.alert.addAlert('success', 'Saved.');
            });
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    deleteBoard(board: Board) {
        this.http.delete('/server/board/' + board._id, {responseType: 'text'}).subscribe(() => {
            this.myBoardsSvc.waitAndReload(() => {
                this.alert.addAlert('success', 'Deleted.');
            });
        }, err => this.alert.httpErrorMessageAlert(err));
    }


    selectAggregation(aggName: string, $index: string) {
        this.myBoardsSvc.filter[aggName][$index].checked = !this.myBoardsSvc.filter[aggName][$index].checked;
        this.myBoardsSvc.loadMyBoards();
    }
}
