import { Component } from '@angular/core';
import { SearchSettings } from 'shared/search/search.model';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'cde-import-permissible-value-modal',
    templateUrl: './import-permissible-value-modal.component.html',
})
export class ImportPermissibleValueModalComponent {
    searchSettings: SearchSettings = {
        classification: [],
        classificationAlt: [],
        datatypes: ['Value List'],
        nihEndorsed: false,
        excludeOrgs: [],
        excludeAllOrgs: false,
        regStatuses: [],
        resultPerPage: 20
    };

    constructor(public dialogRef: MatDialogRef<ImportPermissibleValueModalComponent>) {
    }

}
