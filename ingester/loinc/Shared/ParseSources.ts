import { imported } from 'ingester/shared/utility';

export function parseSources(loinc) {
    const sources: any[] = [];
    const source: any = {sourceName: 'LOINC', imported};
    const basicAttributes = loinc['Basic Attributes'];
    if (basicAttributes) {
        for (const key in basicAttributes) {
            if (basicAttributes.hasOwnProperty(key) && key !== 'Class' && key !== 'Type') {
                source[key] = basicAttributes[key];
            }
        }
    }

    const statusInformation = loinc['Status Information'];
    if (statusInformation) {
        source.Status = statusInformation.Status;
    }

    sources.push(source);
    return sources;
}
