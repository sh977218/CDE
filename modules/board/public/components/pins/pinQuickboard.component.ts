import { Component, Input } from '@angular/core';

import { QuickBoardListService } from '_app/quickBoardList.service';
import { Elt } from 'shared/models.model';
import { interruptEvent } from 'core/browser';

@Component({
    selector: 'cde-pin-quickboard',
    templateUrl: './pinQuickboard.component.html',
})
export class PinQuickboardComponent {
    @Input() elt: Elt;
    @Input() eltIndex: number;
    interruptEvent = interruptEvent;

    constructor(public quickBoardService: QuickBoardListService) {}
}
