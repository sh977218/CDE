import { Component, Inject, Input } from '@angular/core';

import { Designation } from 'shared/models.model';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'cde-designation',
    templateUrl: './newDesignation.component.html'
})
export class NewDesignationComponent {
    noTagFoundMessage = 'No Tags found, Tags are managed in Org Management > List Management';
    @Input() tags = [];
    newDesignation: Designation = new Designation;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.tags = data.tags;
    }

}
