import { Component, Input } from '@angular/core';

import { QuickBoardListService } from '_app/quickBoardList.service';
import { ItemElastic } from 'shared/models.model';
import { interruptEvent } from 'non-core/browser';

@Component({
    selector: 'cde-pin-quickboard',
    templateUrl: './pinQuickboard.component.html',
})
export class PinQuickboardComponent {
    @Input() elt!: ItemElastic;
    @Input() eltIndex!: number;
    interruptEvent = interruptEvent;

    constructor(public quickBoardService: QuickBoardListService) {}
}
