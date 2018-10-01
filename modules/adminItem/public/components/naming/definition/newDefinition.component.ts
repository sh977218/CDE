import { Component, Input } from '@angular/core';

import { Definition } from 'shared/models.model';

@Component({
    selector: 'cde-new-definition',
    templateUrl: './newDefinition.component.html'
})
export class NewDefinitionComponent {
    noTagFoundMessage = 'No Tags found, Tags are managed in Org Management > List Management';
    @Input() tags = [];
    newDefinition: Definition = new Definition;
}
