import { Component, Inject } from '@angular/core';
import { CdeId, IdSource } from 'shared/models.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './add-identifier-modal.component.html',
})
export class AddIdentifierModalComponent {
    newIdentifier: Partial<CdeId> = {};

    constructor(@Inject(MAT_DIALOG_DATA) public idSources: Promise<IdSource[]>) {}
}
