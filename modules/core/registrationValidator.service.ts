import { Injectable } from "@angular/core";
import { OrgHelperService } from "core/orgHelper.service";
import { CurationStatus, StatusValidationRulesOrgs } from 'shared/models.model';

@Injectable()
export class RegistrationValidatorService {
    constructor(private orgHelperService: OrgHelperService) {
    }

    getOrgRulesForCde(cde): StatusValidationRulesOrgs {
        let rulesOrgs: StatusValidationRulesOrgs = {};
        cde.classification.forEach(c => {
            rulesOrgs[c.stewardOrg.name] = this.orgHelperService.getStatusValidationRules(c.stewardOrg.name);
        });
        return rulesOrgs;
    }
}

const statuses = ['Standard', 'Qualified', 'Recorded', 'Candidate', 'Incomplete'];

export function evalCde(cde, orgName: string, status: CurationStatus, cdeOrgRules) {
    const statusesIndex = statuses.indexOf(status);
    return cdeOrgRules[orgName]
        .filter(r => statusesIndex > -1 ? statuses.slice(statusesIndex).includes(r.targetStatus) : true)
        .map(r => ({ruleName: r.ruleName, cdePassingRule: cdePassingRule(cde, r)}));
}

export function conditionsMetForStatusWithinOrg(cde, orgName, status, cdeOrgRules) {
    return cdeOrgRules[orgName] ? evalCde(cde, orgName, status, cdeOrgRules).every(x => x.passing) : true;
}

export function cdePassingRule(cde, rule) {
    function lookForPropertyInNestedObject(object, rule, level) {
        let key = rule.field.split(".")[level];
        if (!object[key]) return false;
        if (level === rule.field.split(".").length - 1) return new RegExp(rule.rule.regex).test(object[key]);
        if (!Array.isArray(object[key])) return lookForPropertyInNestedObject(object[key], rule, level + 1);

        switch (rule.occurence) {
            case 'atLeastOne':
                return object[key].reduce(
                    (acc, subTree) => acc || lookForPropertyInNestedObject(subTree, rule, level + 1), false);
            case 'all':
                return object[key].reduce(
                    (acc, subTree) => acc && lookForPropertyInNestedObject(subTree, rule, level + 1), true);
        }
    }

    return lookForPropertyInNestedObject(cde, rule, 0);
}

export function getStatusRules(cdeOrgRules) {
    let cdeStatusRules = {
        Incomplete: {},
        Candidate: {},
        Recorded: {},
        Qualified: {},
        Standard: {},
        "Preferred Standard": {}
    };

    Object.keys(cdeOrgRules).forEach(orgName => {
        cdeOrgRules[orgName].forEach(rule => {
            if (!cdeStatusRules[rule.targetStatus][orgName]) {
                cdeStatusRules[rule.targetStatus][orgName] = [];
            }
            cdeStatusRules[rule.targetStatus][orgName].push(rule);
        });
    });

    return cdeStatusRules;
}
