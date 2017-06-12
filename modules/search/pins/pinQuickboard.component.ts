import { Component, Inject, Input } from "@angular/core";

@Component({
    selector: "cde-pin-quickboard",
    templateUrl: "./pinQuickboard.component.html",
})
export class PinQuickboardComponent {
    @Input() elt: any;
    @Input() eltIndex: number;

    constructor(@Inject("QuickBoard") public quickBoard) {}

    interruptEvent(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
}
