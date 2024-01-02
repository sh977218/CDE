import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
    AbstractControl,
    ReactiveFormsModule,
    UntypedFormControl,
    ValidationErrors,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { DialogData } from 'classificationManagement/dialog-data';
import { MatInputModule } from '@angular/material/input';
import { NgIf } from '@angular/common';

@Component({
    selector: 'remove-org-classification-dialog',
    templateUrl: './remove-org-classification-dialog.component.html',
    imports: [MatDialogModule, MatInputModule, ReactiveFormsModule, NgIf],
    standalone: true,
})
export class RemoveOrgClassificationDialogComponent {
    userTyped = new UntypedFormControl('');
    fullClassificationArray: string[] = [];

    constructor(
        public dialogRef: MatDialogRef<RemoveOrgClassificationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
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
        const isMatched = nameToBeMatched.trim() === control.value.trim();
        return !isMatched ? { notMatch: { value: control.value } } : null;
    };
}
