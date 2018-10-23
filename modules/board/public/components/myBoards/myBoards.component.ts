import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { UserService } from '_app/user.service';
import { AlertService } from 'alert/alert.service';
import { MyBoardsService } from 'board/public/myBoards.service';

@Component({
    selector: 'cde-my-boards',
    templateUrl: './myBoards.component.html'
})
export class MyBoardsComponent {
    constructor(private alert: AlertService,
                private http: HttpClient,
                public myBoardsSvc: MyBoardsService,
                public userService: UserService) {
        this.myBoardsSvc.loadMyBoards();
    }

    saveBoard(board) {
        this.http.post('/server/board/', board, {responseType: 'text'}).subscribe(() => {
            this.alert.addAlert('success', 'Saved.');
            this.myBoardsSvc.loadMyBoards();
        }, err => this.alert.httpErrorMessageAlert(err));
    }

    deleteBoard(board) {
        this.http.delete('/server/board/' + board._id, {responseType: 'text'}).subscribe(() => {
            this.alert.addAlert('success', 'Deleted.');
            this.myBoardsSvc.loadMyBoards();
        }, err => this.alert.httpErrorMessageAlert('danger', err));
    }


    selectAggregation(aggName, $index) {
        this.myBoardsSvc.filter[aggName][$index].checked = !this.myBoardsSvc.filter[aggName][$index].checked;
        this.myBoardsSvc.loadMyBoards();
    }
}
