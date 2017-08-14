import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'cde-summary-list',
    templateUrl: './summaryList.component.html',
})
export class SummaryListComponent {
    @Input() contentComponent: any;
    @Input() elts: any[];
    @Output() select = new EventEmitter<string>();

    constructor() {}

    trackByElt(index: number, elt: any): number { return elt.tinyId; }
}
