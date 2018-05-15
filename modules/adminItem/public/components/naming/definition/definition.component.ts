import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModalRef, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Definition } from '../../../../../../shared/models.model';

@Component({
    selector: 'cde-definition',
    templateUrl: './definition.component.html'
})
export class DefinitionComponent {
    placeHolder = 'No Tags found, Tags are managed in Org Management > List Management';
    appendTo = 'body';
    modalRef: NgbModalRef;
    @Input() tags = [];
    @Output() onSave = new EventEmitter();
    newDefinition: Definition = new Definition;

    constructor(public activeModal: NgbActiveModal) {
    }

}
