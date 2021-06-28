import { imported } from 'ingester/shared/utility';
import { NichdConfig } from 'ingester/nichd/shared/utility';

export function parseSources(config: NichdConfig) {
    return [{sourceName: config.source, imported}];
}

export function addNichdSource(cde: any, config: NichdConfig) {
    let found = false;
    cde.sources.forEach((d: any) => {
        if (d.sourceName === config.source) {
            found = true;
        }
    });
    if (!found) {
        cde.sources.push({sourceName: config.source, imported});
    }
}
