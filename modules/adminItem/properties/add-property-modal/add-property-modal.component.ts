import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Property } from 'shared/models.model';

@Component({
    templateUrl: './add-property-modal.component.html',
})
export class AddPropertyModalComponent {

    newProperty = new Property();

    constructor(@Inject(MAT_DIALOG_DATA) public orgPropertyKeys: string[]) {
    }

}
