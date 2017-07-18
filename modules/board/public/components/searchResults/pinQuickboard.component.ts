import { Component, Inject, Input, OnInit } from "@angular/core";

@Component({
    selector: "cde-pin-quickboard",
    templateUrl: "./pinQuickboard.component.html",
})
export class PinQuickboardComponent implements OnInit {
    @Input() elt: any;
    @Input() eltIndex: number;
    @Input() module: string;

    quickBoard: any;

    constructor(@Inject("DataElementQuickBoard") public cdeQuickBoard,
                @Inject("FormQuickBoard") public formQuickBoard) {
    }

    ngOnInit() {
        if (this.module === 'cde')
            this.quickBoard = this.cdeQuickBoard;
        if (this.module === 'form')
            this.quickBoard = this.formQuickBoard;
    }

    interruptEvent(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
}
