import { Component, Input } from '@angular/core';

@Component({
    selector: 'cde-admin-item-sources',
    templateUrl: './sources.component.html'
})
export class SourcesComponent {
    @Input() elt: any;

    allowSources = ['NINDS', 'caDSR', 'PhenX', 'LOINC'];
}
