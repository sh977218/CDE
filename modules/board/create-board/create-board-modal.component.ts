import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    templateUrl: './create-board-modal.component.html',
    imports: [NgSwitch, FormsModule, NgSwitchCase, NgSwitchDefault, MatDialogModule],
    standalone: true,
})
export class CreateBoardModalComponent {
    newBoard;
    module = 'cde';

    constructor(
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<CreateBoardModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.newBoard = data;
        this.newBoard.shareStatus = 'Private';
        this.module = data.type;
    }
}
