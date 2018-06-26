import { Component, Input } from '@angular/core';

import { QuickBoardListService } from '_app/quickBoardList.service';
import { Elt } from 'shared/models.model';
import { BrowserService } from 'widget/browser.service';

@Component({
    selector: 'cde-pin-quickboard',
    templateUrl: './pinQuickboard.component.html',
})
export class PinQuickboardComponent {
    @Input() elt: Elt;
    @Input() eltIndex: number;

    BrowserService = BrowserService;

    constructor(public quickBoardService: QuickBoardListService) {}
}
