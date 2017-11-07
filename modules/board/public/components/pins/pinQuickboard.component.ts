import { Component, Input } from '@angular/core';
import { BrowserService } from 'widget/browser.service';
import { QuickBoardListService } from '_app/quickBoardList.service';

@Component({
    selector: 'cde-pin-quickboard',
    templateUrl: './pinQuickboard.component.html',
})
export class PinQuickboardComponent {
    @Input() elt: any;
    @Input() eltIndex: number;

    BrowserService = BrowserService;

    constructor(public quickBoardService: QuickBoardListService) {}
}
