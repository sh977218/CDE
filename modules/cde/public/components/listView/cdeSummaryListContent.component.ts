import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SummaryComponent } from 'search/listView/summaryListItem.component';


@Component({
    selector: 'cde-cde-summary-list-content',
    templateUrl: './cdeSummaryListContent.component.html',
    styles: [`
        dd {
            margin-bottom: 0;
           }
    `]
})
export class CdeSummaryListContentComponent implements SummaryComponent {
    @Input() elt: any;
    @Input() eltIndex: any;
    @Output() select = new EventEmitter<string>();

    defaultAttachmentsFilter = a => a.isDefault === true;
    module = 'cde';

    constructor() {
    }

    getStewards() {
        return this.elt.classification.map(cl => cl.stewardOrg.name).join(' ');
    }

}
