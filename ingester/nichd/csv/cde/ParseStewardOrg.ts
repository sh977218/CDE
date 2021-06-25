import { DEFAULT_NICHD_CONFIG } from '../../shared/utility';

export function parseStewardOrg(config = DEFAULT_NICHD_CONFIG) {
    return {name: config.stewardOrg};
}
