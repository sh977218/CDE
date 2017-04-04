import { Component, Input, ViewChild } from "@angular/core";

@Component({
    selector: "cde-datasets",
    templateUrl: "./datasets.component.html"
})

export class DatasetsComponent {

    @ViewChild("childModal") public childModal: ModalDirective;
    @Input() public elt: any;

}