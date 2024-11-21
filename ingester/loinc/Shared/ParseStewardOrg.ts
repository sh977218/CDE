import {DEFAULT_LOINC_CONFIG} from 'ingester/loinc/Shared/utility';

export function parseStewardOrg(config = DEFAULT_LOINC_CONFIG) {
    return {name: config.stewardOrg};
}
