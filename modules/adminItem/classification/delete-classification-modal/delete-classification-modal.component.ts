import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'cde-delete-classification-modal',
    templateUrl: './delete-classification-modal.component.html',
})
export class DeleteClassificationModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public deleteClassification: string) {

    }
}