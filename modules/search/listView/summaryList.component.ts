import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemElastic } from 'shared/models.model';

@Component({
    selector: 'cde-summary-list',
    templateUrl: './summaryList.component.html',
    styles: [`
        .singleSearchResult {
            margin-bottom: 20px;
            border-top: 3px solid #F1F1F1;
        }
    `]
})
export class SummaryListComponent {
    @Input() contentComponent: any;
    @Input() elts!: ItemElastic[];
    @Output() selectChange = new EventEmitter<string>();

    constructor() {}

    trackByElt(index: number, elt: any): number { return elt.tinyId; }
}
