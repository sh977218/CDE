import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { DialogData } from 'classificationManagement/dialog-data';

@Component({
    templateUrl: './add-child-classification-dialog.component.html',
})
export class AddChildClassificationDialogComponent {
    newClassificationName = new FormControl('', [Validators.required]);
    fullClassificationArray: string[] = [];
    fullClassificationPath: string = '';

    constructor(public dialogRef: MatDialogRef<AddChildClassificationDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: DialogData) {
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