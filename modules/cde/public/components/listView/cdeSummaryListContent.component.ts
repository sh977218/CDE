import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SummaryComponent } from 'search/listView/summaryListItem.component';


@Component({
    selector: 'cde-cde-summary-list-content',
    templateUrl: './cdeSummaryListContent.component.html',
})
export class CdeSummaryListContentComponent implements SummaryComponent {
    @Input() elt: any;
    @Input() eltIndex: any;
    @Output() select = new EventEmitter<string>();

    defaultAttachmentsFilter = a => a.isDefault === true;
    module = 'cde';

    constructor() {}
}
