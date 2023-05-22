import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    templateUrl: './copy-data-element-modal.component.html',
})
export class CopyDataElementModalComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public eltCopy: DataElement,
        public dialogRef: MatDialogRef<CopyDataElementModalComponent>
    ) {}
}
