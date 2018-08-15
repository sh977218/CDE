import { capString } from 'shared/system/util';

export function getFhirResourceMap(f) {
    return isForm(f) && f.displayProfiles.length ? f.displayProfiles[0].fhirProcedureMapping : undefined;
}

export function getIds(f) {
    if (isForm(f)) {
        return f.ids;
    }
    switch (f.elementType) {
        case 'form':
            return f.inForm.form.ids;
        case 'section':
            return undefined;
        case 'question':
            return f.question.cde.ids;
    }
}

export function getMapToFhirResource(f) {
    return f && isMappedTo(f, 'fhir') ? f.mapTo.fhir.resourceType : undefined;
}

export function getTinyId(f) {
    if (isForm(f)) {
        return f.tinyId;
    }
    switch (f.elementType) {
        case 'form':
            return f.inForm.form.tinyId;
        case 'section':
            return undefined;
        case 'question':
            return f.question.cde.tinyId;
    }
}

export function isForm(f) {
    return f.hasOwnProperty('tinyId');
}

export function isMappedTo(f, systemOrProtocol) {
    return !!f.mapTo && !!f.mapTo[systemOrProtocol];
}
