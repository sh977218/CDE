import { Component, Input } from '@angular/core';

@Component({
    selector: 'cde-value-domain-summary',
    templateUrl: './valueDomainSummary.component.html',
})
export class ValueDomainSummaryComponent {
    @Input() elt: any;
    @Input() eltIndex!: number;
}
