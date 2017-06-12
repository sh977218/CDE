import { Component, Inject, Input } from "@angular/core";

@Component({
    selector: "cde-pin-form-quickboard",
    templateUrl: "./pinFormQuickboard.component.html",
})
export class PinFormQuickboardComponent {
    @Input() elt: any;

    constructor(@Inject("FormQuickBoard") public quickBoard) {}

    interruptEvent(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
}
