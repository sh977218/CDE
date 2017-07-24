import { Component, EventEmitter, Inject, Input, Output } from "@angular/core";
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
    @Output() save = new EventEmitter();

    saveForm() {
        this.save.emit();
    }
}