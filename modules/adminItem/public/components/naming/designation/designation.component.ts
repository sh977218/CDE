import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModalRef, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Designation } from '../../../../../../shared/models.model';

@Component({
    selector: 'cde-designation',
    templateUrl: './designation.component.html'
})
export class DesignationComponent {
    placeHolder = 'No Tags found, Tags are managed in Org Management > List Management';
    appendTo = 'body';
    modalRef: NgbModalRef;
    @Input() tags = [];
    @Output() onSave = new EventEmitter();
    newDesignation: Designation = new Designation;

    constructor(public activeModal: NgbActiveModal) {
    }

}
