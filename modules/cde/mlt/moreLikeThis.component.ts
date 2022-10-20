import { Component, Input } from '@angular/core';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeSummaryListContentComponent } from 'cde/listView/cdeSummaryListContent.component';

export type MoreLikeThisDataElement = DataElement & { isCollapsed: boolean };

@Component({
    selector: 'cde-mlt',
    templateUrl: './moreLikeThis.component.html',
})
export class MoreLikeThisComponent {
    @Input() elt!: DataElement;
    @Input() cdes: MoreLikeThisDataElement[] = [];

    cdeSummaryContentComponent = CdeSummaryListContentComponent;
}
