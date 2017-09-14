import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";

@Component({
    selector: "cde-form-general-details",
    templateUrl: "./formGeneralDetails.component.html"
})
export class FormGeneralDetailsComponent {
    @Input() elt: any;
    @Input() canEdit: boolean = false;
    @Output() save = new EventEmitter();
}