import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './confirm-reindex-modal.component.html'
})
export class ConfirmReindexModalComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data:any) {
    }

}