import { Component, Inject, Input, ViewChild } from "@angular/core";
import { ModalDirective } from "ng2-bootstrap/modal";

@Component({
    selector: "cde-linked-forms",
    templateUrl: "./linkedForms.component.html"
})


export class LinkedForms {

    @ViewChild("childModal") public childModal: ModalDirective;
    @Input() public elt: any;

}