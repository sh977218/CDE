import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { OrgHelperService } from "../../../../core/public/orgHelper.service";
import { AlertService } from "../../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-de-general-details",
    templateUrl: "./deGeneralDetails.component.html"
})
export class DeGeneralDetailsComponent {

    constructor(private http: Http,
                @Inject("isAllowedModel") public isAllowedModel,
                @Inject("userResource") public userService,
                private alert: AlertService,
                public orgHelpers: OrgHelperService) {
    }

    @Input() elt: any;
    @Output() save = new EventEmitter();

    editDtMode: boolean;

    saveDataElement() {
        this.save.emit();
    }
}