import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { DialogData } from 'classificationManagement/dialog-data';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';

@Component({
    templateUrl: './add-child-classification-dialog.component.html',
    imports: [MatDialogModule, MatInputModule, ReactiveFormsModule, NgIf],
    standalone: true,
})
export class AddChildClassificationDialogComponent {
    newClassificationName = new UntypedFormControl('', [Validators.required]);
    fullClassificationArray: string[] = [];

    constructor(
        public dialogRef: MatDialogRef<AddChildClassificationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.fullClassificationArray = [data.orgName].concat(data.categories);
    }
    getErrorMessage() {
        if (this.newClassificationName.hasError('required')) {
            return 'You must enter a value';
        }
        if (this.newClassificationName.hasError('pattern')) {
            return 'Classification Name cannot contain ;';
        }
        return '';
    }
}
