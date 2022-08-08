import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
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
