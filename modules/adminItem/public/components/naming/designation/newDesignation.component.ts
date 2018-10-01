import { Component, Input } from '@angular/core';

import { Designation } from 'shared/models.model';

@Component({
    selector: 'cde-designation',
    templateUrl: './newDesignation.component.html'
})
export class NewDesignationComponent {
    noTagFoundMessage = 'No Tags found, Tags are managed in Org Management > List Management';
    @Input() tags = [];
    newDesignation: Designation = new Designation;
}
