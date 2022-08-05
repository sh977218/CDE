import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'cde-copy-data-element-modal',
    templateUrl: './copy-data-element-modal.component.html'
})
export class CopyDataElementModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public eltCopy,
                public dialogRef: MatDialogRef<CopyDataElementModalComponent>) {
    }
}
