import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuickBoardListService } from 'board/public/components/quickBoard/quickBoardList.service';

@Component({
    selector: 'cde-quick-board-cde-summary-list-content',
    templateUrl: './quickBoardCdeSummaryListContent.component.html'
})
export class QuickBoardCdeSummaryListContentComponent {
    @Input() elt: any;
    @Input() eltIndex: any;
    @Output() select = new EventEmitter<string>();

    constructor(private quickBoardListService: QuickBoardListService) {}

    checkboxClick(elt, $event) {
        this.quickBoardListService.toggleEltsToCompare(elt);
        $event.stopPropagation();
    }

    defaultAttachmentsFilter = a => a.isDefault === true;

    removeElt(index, $event) {
        $event.stopPropagation();
        this.quickBoardListService.quickBoard.remove(index);
    }
}
