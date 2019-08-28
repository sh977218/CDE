import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Definition } from 'shared/models.model';

@Component({
    selector: 'cde-new-definition',
    templateUrl: './newDefinition.component.html'
})
export class NewDefinitionComponent {
    @Input() tags = [];
    newDefinition: Definition = new Definition();

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.tags = data.tags;
    }

}
