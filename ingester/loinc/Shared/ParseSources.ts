export function parseSources(loinc) {
    let sources = [];
    let source: any = {source: 'LOINC'};
    if (loinc['BASIC ATTRIBUTES']) {
        source.created = loinc['BASIC ATTRIBUTES']['Created On'];
        source.registrationStatus = loinc['BASIC ATTRIBUTES']['Status'];
    }
    if (loinc['EXAMPLE UNITS']) {
        source.datatype = loinc['EXAMPLE UNITS'][0].Unit;
    }
    sources.push(source);
    return sources;
}