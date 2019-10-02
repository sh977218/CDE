import { orgByName } from 'server/system/mongo-data';
import { classificationAuditPagination } from 'server/system/classificationAuditDb';

export async function getClassificationAuditLog(params) {
    const sort = '-date';
    const skip = params.skip;
    const limit = params.limit;
    const records = await classificationAuditPagination({sort, skip, limit});
    return records;
}

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

