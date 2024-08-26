import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateFormFromBoardModalComponent } from 'board/createFormFromBoard/create-form-from-board-modal/create-form-from-board-modal.component';
import { Board } from 'shared/board.model';

@Component({
    selector: 'cde-create-form-from-board',
    templateUrl: './createFormFromBoard.component.html',
})
export class CreateFormFromBoardComponent {
    @Input() board!: Board;

    constructor(public dialog: MatDialog) {}

    openCreateFormModal() {
        const data = this.board;
        this.dialog.open(CreateFormFromBoardModalComponent, { width: '1200px', data });
    }
}
