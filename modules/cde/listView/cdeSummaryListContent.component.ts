import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SummaryComponent } from 'search/listView/summaryListItem.component';
import { isDefault } from 'shared/models.model';
import { DataElementElastic } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-cde-summary-list-content',
    templateUrl: './cdeSummaryListContent.component.html',
    styleUrls: ['./cdeSummaryListContent.component.scss'],
})
export class CdeSummaryListContentComponent implements SummaryComponent {
    @Input() elt!: DataElementElastic;
    @Input() eltIndex!: number;
    @Output() selectChange = new EventEmitter<string>();

    defaultAttachmentsFilter = isDefault;
    module = 'cde';

    getStewards(): string {
        return (this.elt.classification || []).map(cl => cl.stewardOrg.name).join(', ');
    }
}
