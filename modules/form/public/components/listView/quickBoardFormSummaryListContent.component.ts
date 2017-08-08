import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';

@Component({
    selector: 'cde-quick-board-form-summary-list-content',
    templateUrl: './quickBoardFormSummaryListContent.component.html'
})
export class QuickBoardFormSummaryListContentComponent {
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
