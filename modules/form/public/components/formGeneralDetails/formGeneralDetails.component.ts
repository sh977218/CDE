import { Component, Inject, Input } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-form-general-details",
    templateUrl: "./formGeneralDetails.component.html"
})
export class FormGeneralDetailsComponent  {

    constructor(@Inject("isAllowedModel") public isAllowedModel,
                @Inject("userResource") public userService
    ) {}

    @Input() elt: any;

}