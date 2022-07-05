import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidationWhitelist } from 'shared/models.model';

@Component({
    selector: 'cde-delete-white-list-modal',
    templateUrl: './delete-white-list-modal.component.html'
})
export class DeleteWhiteListModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public selectedWhiteList: ValidationWhitelist) {
    }
}
