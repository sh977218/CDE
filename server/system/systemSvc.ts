import { orgByName } from 'server/orgManagement/orgDb';

export async function disableRule(org, ruleId) {
    org.cdeStatusValidationRules.forEach((rule, i) => {
        if (rule.id === ruleId) {
            org.cdeStatusValidationRules.splice(i, 1);
        }
    });
}

export async function enableRule(org, rule) {
    delete rule._id;
    org.cdeStatusValidationRules.push(rule);
}

