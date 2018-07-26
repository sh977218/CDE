import { Component, Input } from '@angular/core';

import { Elt } from 'shared/models.model';
import { interruptEvent } from 'widget/browser';

@Component({
    selector: 'cde-pin-board',
    templateUrl: './pinBoard.component.html',
})
export class PinBoardComponent {
    @Input() elt: Elt;
    @Input() eltIndex: number;
    @Input() module: any;
    interruptEvent = interruptEvent;
    pinModal: any;

    constructor() {}
}
