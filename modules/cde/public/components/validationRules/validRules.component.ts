import { Component, Input } from '@angular/core';
import { Dictionary } from 'async';
import { cdePassingRule, getStatusRules, RegistrationValidatorService } from 'non-core/registrationValidator.service';
import { DataElement } from 'shared/de/dataElement.model';
import { StatusValidationRules, StatusValidationRulesByOrgReg } from 'shared/models.model';

interface RuleResult {
    name: string;
    result?: string;
    resultPromise: Promise<string>;
}
type RuleResultByOrg = Dictionary<RuleResult[]>;
type RuleResultByOrgReg = Dictionary<RuleResultByOrg>;

@Component({
    selector: 'cde-valid-rules',
    templateUrl: './validRules.component.html'
})
export class ValidRulesComponent {
    private _elt!: DataElement;
    @Input() set elt(elt: DataElement) {
        this._elt = elt;
        this.cdeStatusRules = getStatusRules(this.registrationValidatorService.getOrgRulesForCde(this.elt));
        this.results = {};
        for (const regStatus in this.cdeStatusRules) {
            const resultReg = this.results[regStatus] = {};
            for (const orgName in this.cdeStatusRules[regStatus]) {
                resultReg[orgName] = this.cdeStatusRules[regStatus][orgName].map((rule: StatusValidationRules) => {
                    const result = {
                        name: rule.ruleName,
                        result: undefined,
                        resultPromise: cdePassingRule(this._elt, rule),
                    };
                    function populateResult(data: string) {
                        return result.result = data;
                    }
                    result.resultPromise = result.resultPromise.then(populateResult, populateResult);
                    return result;
                });
            }
        }
    }
    get elt() {
        return this._elt;
    }
    cdeStatusRules: StatusValidationRulesByOrgReg = {};
    keys = Object.keys;
    results: RuleResultByOrgReg = {};

    constructor(private registrationValidatorService: RegistrationValidatorService) {
    }

    hasRules() {
        return this.showStatus(this.cdeStatusRules);
    }

    showStatus(status) {
        return Object.keys(status).length > 0;
    }
}
