import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'cde-board-overview-delete-modal',
    templateUrl: './board-overview-delete-modal.component.html',
})
export class BoardOverviewDeleteModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public board) {
    }
}
