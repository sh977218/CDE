import { Component, Inject, Input, OnInit } from '@angular/core';
import { BrowserService } from 'widget/browser.service';

@Component({
    selector: 'cde-pin-quickboard',
    templateUrl: './pinQuickboard.component.html',
})
export class PinQuickboardComponent implements OnInit {
    @Input() elt: any;
    @Input() eltIndex: number;
    @Input() module: string;

    quickBoard: any;
    BrowserService = BrowserService;

    constructor(@Inject('QuickBoard') public cdeQuickBoard, @Inject('FormQuickBoard') public formQuickBoard) {}

    ngOnInit() {
        if (this.module === 'cde')
            this.quickBoard = this.cdeQuickBoard;
        if (this.module === 'form')
            this.quickBoard = this.formQuickBoard;
    }
}
