import { Component, Input } from '@angular/core';

@Component({
    selector: 'cde-pin-board',
    templateUrl: './pinBoard.component.html',
})
export class PinBoardComponent {
    @Input() elt: any;
    @Input() eltIndex: any;
    @Input() module: any;

    pinModal: any;

    constructor() {}

    interruptEvent(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
}
