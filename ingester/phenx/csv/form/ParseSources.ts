import { DEFAULT_RADX_UP_CONFIG } from 'ingester/phenx/Shared/utility';

export function parseSources(config = DEFAULT_RADX_UP_CONFIG) {
    return [{
        sourceName: config.source
    }];
}
