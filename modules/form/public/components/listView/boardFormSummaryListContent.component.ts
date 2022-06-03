import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoardListService } from 'board/listView/boardList.service';
import { SummaryComponent } from 'search/listView/summaryListItem.component';
import { CdeFormElastic } from 'shared/form/form.model';
import { isDefault } from 'shared/models.model';

@Component({
    selector: 'cde-board-form-summary-list-content',
    templateUrl: './boardFormSummaryListContent.component.html',
})
export class BoardFormSummaryListContentComponent implements SummaryComponent {
    @Input() elt!: CdeFormElastic;
    @Input() eltIndex!: number;
    @Output() select = new EventEmitter<string>();

    defaultAttachmentsFilter = isDefault;
    module = 'form';

    constructor(public boardListService: BoardListService) {}

    getStewards(): string {
        return this.elt.classification ? this.elt.classification.map(cl => cl.stewardOrg.name).join(' ') : '';
    }
}
