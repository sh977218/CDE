import { Component, EventEmitter, Input, Output } from '@angular/core';

import { BoardListService } from 'board/public/components/listView/boardList.service';
import { SummaryComponent } from 'search/listView/summaryListItem.component';
import { Elt } from 'shared/models.model';
import { CdeForm } from 'shared/form/form.model';


@Component({
    selector: 'cde-board-form-summary-list-content',
    templateUrl: './boardFormSummaryListContent.component.html',
})
export class BoardFormSummaryListContentComponent implements SummaryComponent {
    @Input() elt: CdeForm;
    @Input() eltIndex: number;
    @Output() select = new EventEmitter<string>();

    defaultAttachmentsFilter = Elt.isDefault;
    module = 'form';

    constructor(public boardListService: BoardListService) {}

    getStewards() {
        return this.elt.classification.map(cl => cl.stewardOrg.name).join(' ');
    }
}
