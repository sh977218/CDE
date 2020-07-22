import { imported } from 'ingester/shared/utility';

export function parseNichdSources(source) {
    return [{sourceName: source, imported}];
}

export function addNichdSource(cde, source) {
    let found = false;
    cde.sources.forEach(d => {
        if (d.sourceName === source) {
            found = true;
        }
    });
    if (!found) {
        cde.sources.push({sourceName: source, imported});
    }
}
