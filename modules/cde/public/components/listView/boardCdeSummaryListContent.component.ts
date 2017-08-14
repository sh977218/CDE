import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoardListService } from 'board/public/components/listView/boardList.service';
import { SummaryComponent } from 'search/listView/summaryListItem.component';


@Component({
    selector: 'cde-board-cde-summary-list-content',
    templateUrl: './boardCdeSummaryListContent.component.html',
})
export class BoardCdeSummaryListContentComponent implements SummaryComponent {
    @Input() elt: any;
    @Input() eltIndex: any;
    @Output() select = new EventEmitter<string>();

    defaultAttachmentsFilter = a => a.isDefault === true;
    module = 'cde';

    constructor(public boardListService: BoardListService) {}
}
