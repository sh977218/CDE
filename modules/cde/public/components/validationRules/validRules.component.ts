import { Component, Input } from '@angular/core';
import { Dictionary } from 'async';
import { cdePassingRule, getStatusRules, RegistrationValidatorService } from 'non-core/registrationValidator.service';
import { DataElement } from 'shared/de/dataElement.model';
import { StatusValidationRules, StatusValidationRulesByOrg, StatusValidationRulesByOrgReg } from 'shared/models.model';

interface RuleResult {
    name: string;
    result?: string;
    resultPromise: Promise<string>;
}

type RuleResultByOrg = Dictionary<RuleResult[]>;
type RuleResultByOrgReg = Dictionary<RuleResultByOrg>;

interface ValidRulesPromise {
    name: string;
    result?: string;
    resultPromise: Promise<string>;
}
@Component({
    selector: 'cde-valid-rules',
    templateUrl: './validRules.component.html'
})
export class ValidRulesComponent {
    @Input() set elt(elt: DataElement) {
        this._elt = elt;
        this.cdeStatusRules = getStatusRules(this.registrationValidatorService.getOrgRulesForCde(this.elt));
        this.results = {};
        for (const regStatus in this.cdeStatusRules) {
            if (this.cdeStatusRules.hasOwnProperty(regStatus)) {
                const resultReg: Dictionary<ValidRulesPromise[]> = this.results[regStatus] = {};
                for (const orgName in this.cdeStatusRules[regStatus]) {
                    if (this.cdeStatusRules[regStatus].hasOwnProperty(orgName)) {
                        resultReg[orgName] = this.cdeStatusRules[regStatus][orgName].map((rule: StatusValidationRules) => {
                            const result: ValidRulesPromise = {
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
        }
    }
    get elt() {
        return this._elt;
    }
    private _elt!: DataElement;
    cdeStatusRules: StatusValidationRulesByOrgReg = {};
    keys = Object.keys;
    results: RuleResultByOrgReg = {};

    constructor(private registrationValidatorService: RegistrationValidatorService) {
    }

    hasRules() {
        return this.showStatus(this.cdeStatusRules);
    }

    showStatus(status: Dictionary<StatusValidationRulesByOrg>) {
        return Object.keys(status).length > 0;
    }
}
