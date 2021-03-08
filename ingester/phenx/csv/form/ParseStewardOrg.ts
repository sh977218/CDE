import { DEFAULT_RADX_UP_CONFIG } from 'ingester/phenx/Shared/utility';

export function parseStewardOrg(config = DEFAULT_RADX_UP_CONFIG) {
    return {name: config.stewardOrg};
}
