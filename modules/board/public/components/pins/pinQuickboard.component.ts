import { Component, Inject, Input, OnInit } from '@angular/core';
import { BrowserService } from 'widget/browser.service';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';
import { AlertService } from 'system/public/components/alert/alert.service';

@Component({
    selector: 'cde-pin-quickboard',
    templateUrl: './pinQuickboard.component.html',
})
export class PinQuickboardComponent {
    @Input() elt: any;
    @Input() eltIndex: number;

    BrowserService = BrowserService;

    constructor(public quickBoardService: QuickBoardListService) {
    }
}
