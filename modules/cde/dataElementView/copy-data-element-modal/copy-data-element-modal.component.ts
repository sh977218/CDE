import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DataElement } from 'shared/de/dataElement.model';
import { CreateDataElementComponent } from 'cde/createDataElement/createDataElement.component';

@Component({
    templateUrl: './copy-data-element-modal.component.html',
    imports: [MatDialogModule, CreateDataElementComponent],
    standalone: true,
})
export class CopyDataElementModalComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public eltCopy: DataElement,
        public dialogRef: MatDialogRef<CopyDataElementModalComponent>
    ) {}
}
