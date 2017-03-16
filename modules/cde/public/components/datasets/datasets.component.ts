import { Component, Input, ViewChild } from "@angular/core";
import { ModalDirective } from "ng2-bootstrap/modal";

@Component({
    selector: "cde-datasets",
    templateUrl: "./datasets.component.html"
})

export class DatasetsComponent {

    @ViewChild("childModal") public childModal: ModalDirective;
    @Input() public elt: any;

}