import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MyBoardsService } from 'board/myBoards.service';
import { UserService } from '_app/user.service';
import { ModuleItem } from 'shared/models.model';

@Component({
    templateUrl: './pin-to-board-modal.component.html',
})
export class PinToBoardModalComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public module: ModuleItem,
                private dialogRef: MatDialogRef<PinToBoardModalComponent>,
                public myBoardsSvc: MyBoardsService,
                public userService: UserService) {
        this.myBoardsSvc.loadMyBoards(module);

    }

    selectBoard(board) {
        this.dialogRef.close(board);
    }
}
