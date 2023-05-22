import { Component } from '@angular/core';
import { UserService } from '_app/user.service';
import { MyBoardsService } from 'board/myBoards.service';

@Component({
    templateUrl: './myBoards.component.html',
})
export class MyBoardsComponent {
    constructor(public myBoardsSvc: MyBoardsService, public userService: UserService) {
        this.myBoardsSvc.loadMyBoards();
    }

    selectAggregation(aggName: string, $index: string) {
        this.myBoardsSvc.filter[aggName][$index].checked = !this.myBoardsSvc.filter[aggName][$index].checked;
        this.myBoardsSvc.loadMyBoards();
    }
}
