import { Component, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-permissible-value",
    providers: [NgbActiveModal],
    templateUrl: "./permissibleValue.component.html"
})
export class PermissibleValueComponent {
    @Input() public elt: any;
    public valueTypes = [
        {value: "Value List", text: "Value List"},
        {value: "Text", text: "Text"},
        {
            value: "Date",
            text: "Date"
        }, {value: "Number", text: "Number"}, {value: "Externally Defined", text: "Externally Defined"}];
    public edit = true;
    public value;

    saveEditable(event) {

    }
}