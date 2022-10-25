import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ItemElastic } from 'shared/models.model';

@Component({
    selector: 'cde-summary-heading[elt][eltIndex][urlPrefix]',
    templateUrl: './summaryHeading.component.html',
})
export class SummaryHeadingComponent {
    @Input() elt!: ItemElastic;
    @Input() eltIndex!: number;
    @Input() urlPrefix!: string;
    @Output() selectChange = new EventEmitter<string>();
}
