import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ItemElastic } from 'shared/models.model';

@Component({
    selector: 'cde-summary-heading',
    templateUrl: './summaryHeading.component.html',
    styles: [`
        .text-muted {
            color: #696f74 !important;
        }
    `]
})
export class SummaryHeadingComponent {
    @Input() elt!: ItemElastic;
    @Input() eltIndex!: number;
    @Input() urlPrefix!: string;
    @Output() select = new EventEmitter<string>();
}
