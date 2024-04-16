import { Component } from '@angular/core';
import { SearchSettings } from 'shared/search/search.model';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CdeSearchComponent } from 'cde/search/cdeSearch.component';

@Component({
    templateUrl: './import-permissible-value-modal.component.html',
    imports: [CdeSearchComponent, MatDialogModule],
    standalone: true,
})
export class ImportPermissibleValueModalComponent {
    searchSettings: SearchSettings = {
        classification: [],
        classificationAlt: [],
        datatypes: ['Value List'],
        copyrightStatus: [],
        nihEndorsed: false,
        excludeOrgs: [],
        meshTree: '',
        excludeAllOrgs: false,
        regStatuses: [],
        resultPerPage: 20,
    };

    constructor(public dialogRef: MatDialogRef<ImportPermissibleValueModalComponent>) {}
}
