import { Component, Input, OnInit } from "@angular/core";
import { RegistrationValidatorService } from "system/public/components/registrationValidator.service";

@Component({
    selector: "cde-valid-rules",
    templateUrl: "./validRules.component.html"
})
export class ValidRulesComponent implements OnInit {
    @Input() elt: any;

    cdeStatusRules: any;
    cdePassingRule: any;
    keys = Object.keys;

    constructor (private registrationValidatorService: RegistrationValidatorService) {}

    ngOnInit () {
        let cdeOrgRules = this.registrationValidatorService.getOrgRulesForCde(this.elt);
        this.cdeStatusRules = this.registrationValidatorService.getStatusRules(cdeOrgRules);
        this.cdePassingRule = this.registrationValidatorService.cdePassingRule;
    }

    hasRules() {
        return Object.keys(this.cdeStatusRules).length > 0;
    }

    showStatus(status) {
        return Object.keys(status).length > 0;
    }
}
