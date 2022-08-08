import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    templateUrl: './copy-form-modal.component.html'
})
export class CopyFormModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public eltCopy,
                public dialogRef: MatDialogRef<CopyFormModalComponent>) {
    }
}
