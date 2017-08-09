import { Component, Inject, Input, OnInit } from '@angular/core';
import { BrowserService } from 'widget/browser.service';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';

@Component({
    selector: 'cde-pin-quickboard',
    templateUrl: './pinQuickboard.component.html',
})
export class PinQuickboardComponent {
    @Input() elt: any;
    @Input() eltIndex: number;
    @Input() module: string;

    quickBoard: any;
    BrowserService = BrowserService;

    constructor(private quickBoardService: QuickBoardListService) {
    }

    canAddElt(elt) {
        if (this.module === 'cde')
            return this.quickBoardService.canAddDataElement(elt);
        if (this.module === 'form')
            return this.quickBoardService.canAddForm(elt);
    }

    addElt(elt) {
        if (this.module === 'cde')
            this.quickBoardService.addDataElement(elt);
        if (this.module === 'form')
            this.quickBoardService.addForm(elt);
    }
}
