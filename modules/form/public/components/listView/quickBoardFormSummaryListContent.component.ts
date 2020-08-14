import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { isDefault } from 'shared/models.model';
import { CdeFormElastic } from 'shared/form/form.model';

@Component({
    selector: 'cde-quick-board-form-summary-list-content',
    templateUrl: './quickBoardFormSummaryListContent.component.html'
})
export class QuickBoardFormSummaryListContentComponent {
    @Input() elt!: CdeFormElastic;
    @Input() eltIndex!: number;
    @Output() select = new EventEmitter<string>();

    constructor(private quickBoardListService: QuickBoardListService) {
    }

    defaultAttachmentsFilter = isDefault;

    removeElt($event: Event) {
        $event.stopPropagation();
        this.quickBoardListService.removeElement(this.elt);
    }
}
