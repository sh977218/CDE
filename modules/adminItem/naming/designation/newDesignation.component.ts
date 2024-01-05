import { Component, Inject, Input } from '@angular/core';

import { Designation } from 'shared/models.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'cde-designation',
    templateUrl: './newDesignation.component.html',
})
export class NewDesignationComponent {
    @Input() tags = [];
    newDesignation: Designation = { designation: '' };

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.tags = data.tags;
    }
}
