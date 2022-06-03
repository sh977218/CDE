import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BoardListService } from 'board/listView/boardList.service';
import { SummaryComponent } from 'search/listView/summaryListItem.component';
import { isDefault } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-board-cde-summary-list-content',
    templateUrl: './boardCdeSummaryListContent.component.html',
    styleUrls: ['./boardCdeSummaryListContent.component.scss']
})
export class BoardCdeSummaryListContentComponent implements SummaryComponent {
    @Input() elt!: DataElement;
    @Input() eltIndex!: number;
    @Output() select = new EventEmitter<string>();

    defaultAttachmentsFilter = isDefault;
    module = 'cde';

    constructor(public boardListService: BoardListService) {}
}
