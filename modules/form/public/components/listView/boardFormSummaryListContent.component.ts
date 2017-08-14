import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoardListService } from 'board/public/components/listView/boardList.service';
import { SummaryComponent } from 'search/listView/summaryListItem.component';


@Component({
    selector: 'cde-board-form-summary-list-content',
    templateUrl: './boardFormSummaryListContent.component.html',
})
export class BoardFormSummaryListContentComponent implements SummaryComponent {
    @Input() elt: any;
    @Input() eltIndex: any;
    @Output() select = new EventEmitter<string>();

    defaultAttachmentsFilter = a => a.isDefault === true;
    module = 'form';

    constructor(public boardListService: BoardListService) {}

    getStewards() {
        return this.elt.classification.map(cl => cl.stewardOrg.name).join(' ');
    }
}
