import { imported } from 'ingester/shared/utility';

export function parseNinrSources(source) {
    return [{sourceName: source, imported}];
}

export function addNinrSource(existingCde, newCdeObj) {
    const nonNinrSources = existingCde.sources.filter(s => s.sourceName !== 'NINR');
    const ninrSources = newCdeObj.sources.filter(s => s.sourceName === 'NINR');
    existingCde.sources = ninrSources.concat(nonNinrSources);
}
