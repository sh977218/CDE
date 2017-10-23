import { Injectable } from "@angular/core";
import { OrgHelperService } from "core/orgHelper.service";

@Injectable()
export class RegistrationValidatorService {
    constructor (private orgHelperService: OrgHelperService) {}

    evalCde(cde, orgName, status, cdeOrgRules) {
        let orgRules = cdeOrgRules[orgName];
        let rules = orgRules.filter(function (r) {
            let s = r.targetStatus;
            if (status === 'Incomplete') return s === 'Incomplete';
            if (status === 'Candidate') return s === 'Incomplete' || s === 'Candidate';
            if (status === 'Recorded') return s === 'Incomplete' || s === 'Candidate' || s === 'Recorded';
            if (status === 'Qualified') return s === 'Incomplete' || s === 'Candidate' || s === 'Recorded' || s === 'Qualified';
            if (status === 'Standard') return s === 'Incomplete' || s === 'Candidate' || s === 'Recorded' || s === 'Qualified' || s === 'Standard';
            return true;
        });
        if (rules.length === 0) return [];
        return rules.map((r) => {
            return {ruleName: r.ruleName, cdePassingRule: this.cdePassingRule(cde, r)};
        });
    }

    conditionsMetForStatusWithinOrg(cde, orgName, status, cdeOrgRules) {
        if (!cdeOrgRules[orgName]) return true;
        let results = this.evalCde(cde, orgName, status, cdeOrgRules);
        return results.every(function (x) {
            return x.passing;
        });
    }

    cdePassingRule(cde, rule) {
        function checkRe(field, rule) {
            return new RegExp(rule.rule.regex).test(field);
        }
        function lookForPropertyInNestedObject(object, rule, level) {
            let key = rule.field.split(".")[level];
            if (!object[key]) return false;
            if (level === rule.field.split(".").length - 1) return checkRe(object[key], rule);
            if (!Array.isArray(object[key])) return lookForPropertyInNestedObject(object[key], rule, level + 1);
            if (Array.isArray(object[key])) {
                let result;
                if (rule.occurence === "atLeastOne") {
                    result = false;
                    object[key].forEach(function (subTree) {
                        result = result || lookForPropertyInNestedObject(subTree, rule, level + 1);
                    });
                    return result;
                }
                if (rule.occurence === "all") {
                    result = true;
                    object[key].forEach(function (subTree) {
                        result = result && lookForPropertyInNestedObject(subTree, rule, level + 1);
                    });
                    return result;
                }
            }
        }
        return lookForPropertyInNestedObject(cde, rule, 0);
    }

    getOrgRulesForCde(cde) {
        let result = {};
        cde.classification.forEach((org) => {
            result[org.stewardOrg.name] = this.orgHelperService.getStatusValidationRules(org.stewardOrg.name);
        });
        return result;
    }

    getStatusRules(cdeOrgRules) {
        let cdeStatusRules = {
            Incomplete: {},
            Candidate: {},
            Recorded: {},
            Qualified: {},
            Standard: {},
            "Preferred Standard": {}
        };

        Object.keys(cdeOrgRules).forEach(function (orgName) {
            cdeOrgRules[orgName].forEach(function (rule) {
                if (!cdeStatusRules[rule.targetStatus][orgName]) cdeStatusRules[rule.targetStatus][orgName] = [];
                cdeStatusRules[rule.targetStatus][orgName].push(rule);
            });
        });

        return cdeStatusRules;
    }
}
