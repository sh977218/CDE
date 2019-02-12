import { Component, Input, OnInit } from '@angular/core';
import { cdePassingRule, getStatusRules, RegistrationValidatorService } from 'core/registrationValidator.service';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-valid-rules',
    templateUrl: './validRules.component.html'
})
export class ValidRulesComponent implements OnInit {
    @Input() elt: DataElement;
    cdeStatusRules;
    cdePassingRule = cdePassingRule;
    keys = Object.keys;

    constructor(private registrationValidatorService: RegistrationValidatorService) {
    }

    ngOnInit() {
        this.cdeStatusRules = getStatusRules(this.registrationValidatorService.getOrgRulesForCde(this.elt));
    }

    hasRules() {
        return Object.keys(this.cdeStatusRules).length > 0;
    }

    showStatus(status) {
        return Object.keys(status).length > 0;
    }
}
