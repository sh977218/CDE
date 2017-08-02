import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";

@Component({
    selector: "cde-form-general-details",
    templateUrl: "./formGeneralDetails.component.html"
})
export class FormGeneralDetailsComponent {

    constructor(@Inject("isAllowedModel") public isAllowedModel,
                @Inject("userResource") public userService) {
    }

    @Input() elt: any;
    @Output() save = new EventEmitter();
}