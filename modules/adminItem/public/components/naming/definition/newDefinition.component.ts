import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Definition } from '../../../../../../shared/models.model';

@Component({
    selector: 'cde-new-definition',
    templateUrl: './newDefinition.component.html'
})
export class NewDefinitionComponent {
    placeHolder = 'No Tags found, Tags are managed in Org Management > List Management';
    @Input() tags = [];
    @Output() onSave = new EventEmitter();
    newDefinition: Definition = new Definition;

    constructor(public activeModal: NgbActiveModal) {
    }

}
