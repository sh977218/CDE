import { Component, Inject, Input, OnInit } from "@angular/core";
import "rxjs/add/operator/map";

@Component({
    selector: "cde-de-general-details",
    templateUrl: "./deGeneralDetails.component.html"
})
export class DeGeneralDetailsComponent  {

    constructor(@Inject("Alert") private alert,
                @Inject("isAllowedModel") public isAllowedModel,
                @Inject("OrgHelpers") private orgHelpers
               ) {
    }

    @Input() elt: any;

    editDtMode: boolean;
    ckeditcontent: string;


}