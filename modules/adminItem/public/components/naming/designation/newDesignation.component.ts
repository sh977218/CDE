import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Designation } from '../../../../../../shared/models.model';

@Component({
    selector: 'cde-designation',
    templateUrl: './newDesignation.component.html'
})
export class NewDesignationComponent {
    noTagFoundMessage = 'No Tags found, Tags are managed in Org Management > List Management';
    @Input() tags = [];
    @Output() onSave = new EventEmitter();
    newDesignation: Designation = new Designation;

    constructor(public activeModal: NgbActiveModal) {
    }

}
