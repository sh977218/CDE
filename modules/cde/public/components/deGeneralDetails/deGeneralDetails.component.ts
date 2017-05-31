import { Component, Inject, Input, OnInit } from "@angular/core";
import "rxjs/add/operator/map";
import {OrgHelperService} from "../../../../system/orgHelper.service";

@Component({
    selector: "cde-de-general-details",
    templateUrl: "./deGeneralDetails.component.html"
})
export class DeGeneralDetailsComponent  {

    constructor(@Inject("isAllowedModel") public isAllowedModel,
                @Inject("userResource") public userService,
                public orgHelpers: OrgHelperService
    ) {
    }

    @Input() elt: any;

    editDtMode: boolean;


}