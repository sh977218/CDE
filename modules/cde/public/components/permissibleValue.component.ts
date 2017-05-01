import { Component, Inject, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
    selector: "cde-permissible-value",
    providers: [NgbActiveModal],
    templateUrl: "./permissibleValue.component.html",
    styles: ["a { border-bottom: 0px !important; }"]
})
export class PermissibleValueComponent {
    @Input() public elt: any;
    public valueTypes = [
        {value: 1, text: "Value List"},
        {value: 2, text: "Text"},
        {value: 3, text: "Date"},
        {value: 4, text: "Number"},
        {value: "Externally Defined", text: "Externally Defined"}
    ];
    public edit = true;
    public value = 4;

    constructor(@Inject("isAllowedModel") public isAllowedModel) {

    }

    saveEditable(value) {
        //call to http service
        console.log('http.service: ' + value);
    }
}