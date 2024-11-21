import {imported} from 'ingester/shared/utility';

export function parseSources() {
    const sources: any[] = [];
    sources.push({
        sourceName: 'PhenX',
        imported
    });

    return sources;
}
