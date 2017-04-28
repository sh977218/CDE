import { Component, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-permissible-value",
    providers: [NgbActiveModal],
    templateUrl: "./permissibleValue.component.html"
})
export class PermissibleValueComponent {
    @Input() public elt: any;
    public valueTypes = ["Value List", "Text", "Date", "Number", "Externally Defined"];
    public edit = true;

    saveEditable(event) {

    }
}