import { Component, Input, Output, ViewChild, EventEmitter } from "@angular/core";
import { SaveModalComponent } from "./saveModal/saveModal.component";

@Component({
    selector: "cde-update-element",
    templateUrl: "./cdeUpdateElement.component.html"
})
export class CdeUpdateElementComponent {
    @Input() elt: any;
    @Output() discard = new EventEmitter();
    @Output() save = new EventEmitter();

    @ViewChild("saveModal") public saveModal: SaveModalComponent;

    discardChange() {
        this.discard.emit();
    }

}