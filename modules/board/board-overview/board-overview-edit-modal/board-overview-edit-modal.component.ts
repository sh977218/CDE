import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
    templateUrl: './board-overview-edit-modal.component.html',
})
export class BoardOverviewEditModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public board) {

    }

    onBoardShareStatusChange($event: MatButtonToggleChange) {
        this.board.shareStatus = $event.value;
    }
}
