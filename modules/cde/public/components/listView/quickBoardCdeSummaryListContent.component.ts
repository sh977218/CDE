import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';

@Component({
    selector: 'cde-quick-board-cde-summary-list-content',
    templateUrl: './quickBoardCdeSummaryListContent.component.html'
})
export class QuickBoardCdeSummaryListContentComponent {
    @Input() elt: any;
    @Input() eltIndex: any;
    @Output() select = new EventEmitter<string>();

    constructor(private quickBoardService: QuickBoardListService) {
    }

    defaultAttachmentsFilter = a => a.isDefault === true;

    removeElt(event) {
        event.stopPropagation();
        this.quickBoardService.removeElement(this.elt);
    }
}
