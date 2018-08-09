import { Component, EventEmitter, Input, Output } from '@angular/core';

import { SummaryComponent } from 'search/listView/summaryListItem.component';
import { Elt } from 'shared/models.model';
import { CdeForm } from 'shared/form/form.model';


@Component({
    selector: 'cde-form-summary-list-content',
    templateUrl: './formSummaryListContent.component.html',
})
export class FormSummaryListContentComponent implements SummaryComponent {
    @Input() elt: CdeForm;
    @Input() eltIndex: number;
    @Output() select = new EventEmitter<string>();

    defaultAttachmentsFilter = Elt.isDefault;
    module = 'form';

    constructor() {}

    getStewards() {
        return this.elt.classification.map(cl => cl.stewardOrg.name).join(' ');
    }
}
