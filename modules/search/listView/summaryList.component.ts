import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemElastic } from 'shared/item';

@Component({
    selector: 'cde-summary-list',
    templateUrl: './summaryList.component.html',
    styles: [
        `
            .singleSearchResult {
                margin-bottom: 20px;
                border-top: 3px solid #f1f1f1;
            }
        `,
    ],
})
export class SummaryListComponent {
    @Input() contentComponent: any;
    @Input() elts!: ItemElastic[];
    @Output() selectChange = new EventEmitter<string>();

    trackByElt(index: number, elt: any): number {
        return elt.tinyId;
    }
}
