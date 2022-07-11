import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { MyBoardsService } from 'board/myBoards.service';

@Component({
    selector: 'cde-create-board-modal',
    templateUrl: './create-board-modal.component.html'
})
export class CreateBoardModalComponent {
    newBoard;
    module = 'cde';

    constructor(public dialog: MatDialog,
                public dialogRef: MatDialogRef<CreateBoardModalComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any) {
        this.newBoard = data;
        this.newBoard.shareStatus = 'Private';
        this.module = data.type;
    }
}
