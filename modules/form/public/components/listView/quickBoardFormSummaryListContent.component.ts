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

    constructor(private quickBoardListService: QuickBoardListService) {
    }

    defaultAttachmentsFilter = a => a.isDefault === true;

    removeElt($event) {
        $event.stopPropagation();
        this.quickBoardListService.removeElement(this.elt);
    }
}
