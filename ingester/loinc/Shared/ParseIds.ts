export function parseIds(loinc) {
    const ids = [];
    ids.push({source: 'LOINC', id: loinc.loincId, version: loinc.VERSION});
    return ids;
}
