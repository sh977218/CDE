import { Component, Inject, Input } from "@angular/core";
import { Http } from "@angular/http";
import { AlertService } from "../../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-form-general-details",
    templateUrl: "./formGeneralDetails.component.html"
})
export class FormGeneralDetailsComponent {

    constructor(private http: Http,
                private alert: AlertService,
                @Inject("isAllowedModel") public isAllowedModel,
                @Inject("userResource") public userService) {
    }

    @Input() elt: any;

    saveForm() {
        this.http.put("/form/tinyId/" + this.elt.tinyId, this.elt).map(res => res.json()).subscribe(res => {
            if (res) {
                this.elt = res;
                this.alert.addAlert("success", "Form saved.");
            }
        }, err => this.alert.addAlert("danger", err));
    }
}