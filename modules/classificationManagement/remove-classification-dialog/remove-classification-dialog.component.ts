import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DialogData } from 'classificationManagement/dialog-data';

@Component({
    selector: 'remove-classification-dialog',
    templateUrl: './remove-classification-dialog.component.html',
})
export class RemoveClassificationDialogComponent {
    userTyped = new FormControl('');
    fullClassificationArray: string[] = [];
    fullClassificationPath: string = '';


    constructor(public dialogRef: MatDialogRef<RemoveClassificationDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: DialogData) {
        this.fullClassificationArray = [data.orgName].concat(data.categories);
        const confirmClassificationName = this.fullClassificationArray[this.fullClassificationArray.length - 1];
        this.userTyped.setValidators([Validators.required, stringMatchValidator(confirmClassificationName)]);
    }

    getErrorMessage() {
        if (this.userTyped.hasError('required')) {
            return 'You must enter a value.';
        }
        if (this.userTyped.hasError('notMatch')) {
            return 'Classification name does not matched.';
        }
        return '';
    }

}

/** Match string with a given string */
export function stringMatchValidator(nameToBeMatched: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const isMatched = nameToBeMatched === control.value
        return !isMatched ? {notMatch: {value: control.value}} : null;
    };
}