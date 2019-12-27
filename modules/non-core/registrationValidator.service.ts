import { Injectable } from '@angular/core';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { umlsPvFilter } from 'shared/de/umls';
import {
    CurationStatus, Item, StatusValidationRules, StatusValidationRulesByOrg, StatusValidationRulesByOrgReg
} from 'shared/models.model';

@Injectable()
export class RegistrationValidatorService {
    constructor(private orgHelperService: OrgHelperService) {
    }

    getOrgRulesForCde(item: Item): StatusValidationRulesByOrg {
        const rulesOrgs: StatusValidationRulesByOrg = {};
        if (item.classification) {
            item.classification.forEach(c => {
                rulesOrgs[c.stewardOrg.name] = this.orgHelperService.getStatusValidationRules(c.stewardOrg.name);
            });
        }
        return rulesOrgs;
    }
}

const statuses: CurationStatus[] = ['Standard', 'Qualified', 'Recorded', 'Candidate', 'Incomplete'];
export interface RuleStatus {
    ruleError?: string;
    ruleName: string;
    ruleResultPromise: Promise<string>;
}

export function processRules(cde: any, orgName: string, status: CurationStatus|undefined,
                             cdeOrgRules: StatusValidationRulesByOrg): RuleStatus[] | undefined {
    const statusesIndex = statuses.indexOf(status as CurationStatus);
    const orgRules = cdeOrgRules[orgName];
    return !Array.isArray(orgRules) ? undefined : orgRules
        .filter((r: StatusValidationRules) => statusesIndex > -1 ? statuses.slice(statusesIndex).includes(r.targetStatus) : true)
        .map((r: StatusValidationRules) => ({ruleName: r.ruleName, ruleResultPromise: cdePassingRule(cde, r)}));
}

function lookForPropertyInNestedObject(cde: any, rule: StatusValidationRules, obj: any,  fields: string[]): Promise<string> {
    const key = fields[0];
    if (!obj[key]) {
        if (key === 'permissibleValues') {
            return Promise.resolve('');
        }
        return Promise.resolve(`key ${key} not found`);
    }
    if (fields.length === 1) {
        if (rule.rule.regex) {
            return Promise.resolve(new RegExp(rule.rule.regex).test(obj[key])
                ? '' : `${rule.rule.regex} not found in ${obj[key]}`);
        } else if (rule.rule.customValidations) {
            if (rule.rule.customValidations.includes('permissibleValuesUMLS')) {
                const pvs = obj[key].filter(umlsPvFilter);
                if (!pvs.length) {
                    return Promise.resolve('');
                }
                return fetch('/server/de/umls', {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(obj[key]),
                })
                    .then(res => res.ok ? '' : res.text(), err => err);
            }
        }
        return Promise.resolve('field validation not found');
    }
    if (!Array.isArray(obj[key])) {
        return lookForPropertyInNestedObject(cde, rule, obj[key], fields.slice(1));
    }
    switch (rule.occurence) {
        case 'atLeastOne':
            return Promise.resolve(obj[key].reduce(
                (acc: boolean, subTree: any) => acc || lookForPropertyInNestedObject(cde, rule, subTree, fields.slice(1)),
                false
            ));
        case 'all':
            return Promise.resolve(obj[key].reduce(
                (acc: boolean, subTree: any) => acc && lookForPropertyInNestedObject(cde, rule, subTree, fields.slice(1)),
                true
            ));
    }
    return Promise.resolve('validation not found');
}

export function cdePassingRule(cde: any, rule: StatusValidationRules): Promise<string> {
    return lookForPropertyInNestedObject(cde, rule, cde, rule.field.split('.'));
}

export function getStatusRules(cdeOrgRules: StatusValidationRulesByOrg): StatusValidationRulesByOrgReg {
    const cdeStatusRules: StatusValidationRulesByOrgReg = {
        Incomplete: {},
        Candidate: {},
        Recorded: {},
        Qualified: {},
        Standard: {},
        'Preferred Standard': {}
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
