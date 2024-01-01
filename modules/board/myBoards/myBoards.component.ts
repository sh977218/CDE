import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgForOf, NgIf } from '@angular/common';
import { CreateBoardComponent } from 'board/create-board/create-board.component';
import { BoardOverviewModule } from 'board/board-overview.module';
import { RouterLink } from '@angular/router';

import { UserService } from '_app/user.service';
import { MyBoardsService } from 'board/myBoards.service';

@Component({
    templateUrl: './myBoards.component.html',
    imports: [MatIconModule, NgIf, CreateBoardComponent, NgForOf, BoardOverviewModule, RouterLink],
    providers: [MyBoardsService],
    standalone: true,
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
