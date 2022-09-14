import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormControl, Validators } from '@angular/forms';
import { DialogData } from 'classificationManagement/dialog-data';

@Component({
    selector: 'rename-classification-dialog',
    templateUrl: './rename-classification-dialog.component.html',
})
export class RenameClassificationDialogComponent {
    newClassificationName = new UntypedFormControl('', [Validators.required]);
    fullClassificationArray: string[] = [];

    constructor(
        public dialogRef: MatDialogRef<RenameClassificationDialogComponent>,
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
