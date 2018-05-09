import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'cde-summary-list',
    templateUrl: './summaryList.component.html',
    styles: [`
        .singleSearchResult {
            padding-left: 10px;
            margin-bottom: 20px;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
            border-left: 3px solid rgba(0, 0, 0, 0.1);
        }
    `]
})
export class SummaryListComponent {
    @Input() contentComponent: any;
    @Input() elts: any[];
    @Output() select = new EventEmitter<string>();

    constructor() {}

    trackByElt(index: number, elt: any): number { return elt.tinyId; }
}
