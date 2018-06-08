import { Component, Input } from '@angular/core';

import { BrowserService } from 'widget/browser.service';

@Component({
    selector: 'cde-pin-board',
    templateUrl: './pinBoard.component.html',
})
export class PinBoardComponent {
    @Input() elt: any;
    @Input() eltIndex: any;
    @Input() module: any;
    BrowserService = BrowserService;
    pinModal: any;

    constructor() {}
}
