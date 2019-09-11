import { imported } from 'ingester/shared/utility';

export function parseSources(loinc) {
    const sources: any[] = [];
    const source: any = {sourceName: 'LOINC', imported};
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
