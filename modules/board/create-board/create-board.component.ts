import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '_app/user.service';
import { Item } from 'shared/models.model';
import { CreateBoardModalComponent } from 'board/create-board/create-board-modal.component';

@Component({
    selector: 'cde-create-board',
    templateUrl: './create-board.component.html'
})
export class CreateBoardComponent {
    @Input() elts: Item[] = [];

    @Input() module;
    newBoard: any;

    constructor(public dialog: MatDialog,
                public userSvc: UserService) {
    }

    openCreateNewBoardModal() {
        this.newBoard = {
            type: this.module,
            pins: this.elts.map(e => ({
                tinyId: e.tinyId,
                name: e.designations[0].designation,
                type: this.module
            }))
        };

        this.dialog.open(CreateBoardModalComponent, {
            width: '800px',
            data: this.newBoard,
        });
    }
}
