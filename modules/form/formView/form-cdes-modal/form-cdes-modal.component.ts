import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'cde-form-cdes-modal',
    templateUrl: './form-cdes-modal.component.html',
})
export class FormCdesModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public questions){

    }
}
