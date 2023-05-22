import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormQuestion } from 'shared/form/form.model';

@Component({
    templateUrl: './form-cdes-modal.component.html',
})
export class FormCdesModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public questions: FormQuestion[]) {}
}
