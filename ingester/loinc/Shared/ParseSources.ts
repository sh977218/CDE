export function parseSources(loinc) {
    const sources = [];
    const source: any = {sourceName: 'LOINC'};
    if (loinc['BASIC ATTRIBUTES']) {
        source.created = loinc['BASIC ATTRIBUTES']['Created On'];
        source.registrationStatus = loinc['BASIC ATTRIBUTES'].Status;
    }
    if (loinc['EXAMPLE UNITS']) {
        source.datatype = loinc['EXAMPLE UNITS'][0].Unit;
    }
    sources.push(source);
    return sources;
}