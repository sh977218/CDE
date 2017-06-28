import { Component, Inject, Input, OnInit } from '@angular/core';

@Component({
    selector: 'cde-pin-board',
    templateUrl: './pinBoard.component.html',
})
export class PinBoardComponent implements OnInit {
    @Input() elt: any;
    @Input() eltIndex: any;
    @Input() module: any;

    pinModal: any;

    constructor(@Inject('PinModal') public PinModal) {}

    ngOnInit() {
        this.pinModal = this.PinModal.new(this.module);
    }

    interruptEvent(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
}
