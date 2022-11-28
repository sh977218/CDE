import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SummaryComponent } from 'search/listView/summaryListItem.component';
import { isDefault } from 'shared/models.model';
import { CdeFormElastic } from 'shared/form/form.model';

@Component({
    selector: 'cde-form-summary-list-content',
    templateUrl: './formSummaryListContent.component.html',
    styleUrls: ['./formSummaryListContent.component.scss'],
})
export class FormSummaryListContentComponent implements SummaryComponent {
    @Input() elt!: CdeFormElastic;
    @Input() eltIndex!: number;
    @Output() selectChange = new EventEmitter<string>();

    defaultAttachmentsFilter = isDefault;
    module = 'form';

    getStewards(): string {
        return (this.elt.classification || [])
            .map(cl => cl.stewardOrg.name)
            .join(', ');
    }
}
