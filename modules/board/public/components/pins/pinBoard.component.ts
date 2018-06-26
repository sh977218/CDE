import { Component, Input } from '@angular/core';

import { Elt } from 'shared/models.model';
import { BrowserService } from 'widget/browser.service';

@Component({
    selector: 'cde-pin-board',
    templateUrl: './pinBoard.component.html',
})
export class PinBoardComponent {
    @Input() elt: Elt;
    @Input() eltIndex: number;
    @Input() module: any;
    BrowserService = BrowserService;
    pinModal: any;

    constructor() {}
}
