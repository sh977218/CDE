import { capString } from 'shared/system/util';

export function parseStewardOrg(orgInfo) {
    return {name: orgInfo['stewardOrgName']};
}