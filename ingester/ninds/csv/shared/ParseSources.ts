import { imported } from 'ingester/shared/utility';

export function parseSources() {
    return [{sourceName: 'NINDS Preclinical TBI', imported}];
}

export function parseNhlbiSources() {
    return [{sourceName: 'NHLBI Sickle Cell', imported}];
}
