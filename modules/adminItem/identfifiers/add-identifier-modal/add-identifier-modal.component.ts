import { Component, Inject } from '@angular/core';
import { CdeId } from 'shared/models.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './add-identifier-modal.component.html'
})
export class AddIdentifierModalComponent {
    newIdentifier: CdeId = new CdeId();

    constructor(@Inject(MAT_DIALOG_DATA) public idSources) {
    }

}
