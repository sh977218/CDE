export function parseIds(loinc) {
    const ids: any[] = [];
    ids.push({source: 'LOINC', id: loinc['LOINC Code'], version: loinc.VERSION});
    return ids;
}
