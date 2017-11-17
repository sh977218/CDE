import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdeForm } from 'core/form.model';
import { SummaryComponent } from 'search/listView/summaryListItem.component';


@Component({
    selector: 'cde-form-summary-list-content',
    templateUrl: './formSummaryListContent.component.html',
})
export class FormSummaryListContentComponent implements SummaryComponent {
    @Input() elt: CdeForm;
    @Input() eltIndex: number;
    @Output() select = new EventEmitter<string>();

    defaultAttachmentsFilter = a => a.isDefault === true;
    module = 'form';

    constructor() {}

    getStewards() {
        return this.elt.classification.map(cl => cl.stewardOrg.name).join(' ');
    }
}
