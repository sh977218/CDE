import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Board } from 'shared/board.model';

@Component({
    templateUrl: './board-overview-edit-modal.component.html',
})
export class BoardOverviewEditModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public board: Board) {}

    onBoardShareStatusChange($event: MatButtonToggleChange) {
        this.board.shareStatus = $event.value;
    }
}
