import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './client-error-detail-modal.component.html',
})
export class ClientErrorDetailModalComponent {
    error;
    constructor(@Inject(MAT_DIALOG_DATA) data: any) {
        this.error = data;
    }
}
