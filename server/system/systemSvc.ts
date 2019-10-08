import { orgByName } from 'server/orgManagement/orgDb';

export async function disableRule(orgName, ruleId) {
    const org = await orgByName(orgName);
    org.cdeStatusValidationRules.forEach((rule, i) => {
        if (rule.id === ruleId) {
            org.cdeStatusValidationRules.splice(i, 1);
        }
    });
    return org.save();
}

export async function enableRule(orgName, rule) {
    const org = await orgByName(orgName);
    delete rule._id;
    org.cdeStatusValidationRules.push(rule);
    return org.save();
}

