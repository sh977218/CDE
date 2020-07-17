import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { isDefault } from 'shared/models.model';
import { DataElementElastic } from 'shared/de/dataElement.model';

@Component({
    templateUrl: './quickBoardCdeSummaryListContent.component.html'
})
export class QuickBoardCdeSummaryListContentComponent {
    @Input() elt!: DataElementElastic;
    @Input() eltIndex!: number;
    @Output() select = new EventEmitter<string>();

    constructor(private quickBoardService: QuickBoardListService) {
    }

    defaultAttachmentsFilter = isDefault;

    removeElt(event: Event) {
        event.stopPropagation();
        this.quickBoardService.removeElement(this.elt);
    }
}
