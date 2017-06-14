import { Component, Inject, Input } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-form-term-mapping",
    templateUrl: "./formTermMapping.component.html"
})

export class FormTermMappingComponent  {

    constructor(@Inject("isAllowedModel") public isAllowedModel,
                @Inject("userResource") public userService
    ) {}

    @Input() elt: any;


}