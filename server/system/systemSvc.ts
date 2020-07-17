import { Organization, StatusValidationRules } from 'shared/system/organization';

export async function disableRule(org: Organization, ruleId: number) {
    org.cdeStatusValidationRules.forEach((rule, i) => {
        if (rule.id === ruleId) {
            org.cdeStatusValidationRules.splice(i, 1);
        }
    });
}

export async function enableRule(org: Organization, rule: StatusValidationRules & {_id?: string}) {
    delete rule._id;
    org.cdeStatusValidationRules.push(rule);
}

