import { Component, Inject, Input } from '@angular/core';

import { Definition } from 'shared/models.model';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'cde-new-definition',
    templateUrl: './newDefinition.component.html'
})
export class NewDefinitionComponent {
    noTagFoundMessage = 'No Tags found, Tags are managed in Org Management > List Management';
    @Input() tags = [];
    newDefinition: Definition = new Definition;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.tags = data.tags;
    }

}
