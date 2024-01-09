import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CdeForm } from 'shared/form/form.model';
import { CreateFormComponent } from '../../createForm/createForm.component';

@Component({
    templateUrl: './copy-form-modal.component.html',
    imports: [MatDialogModule, CreateFormComponent],
    standalone: true,
})
export class CopyFormModalComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public eltCopy: CdeForm,
        public dialogRef: MatDialogRef<CopyFormModalComponent>
    ) {}
}
