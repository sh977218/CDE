import { codeSystemOut } from 'shared/mapping/fhir';

export function getText(coding) {
    return coding ? coding.display : '';
}

export function getTextFromArray(coding) {
    return Array.isArray(coding) && coding.some(c => !!c.display) || '';
}

export function getTextFromArrayAll(coding) {
    return Array.isArray(coding) && coding.reduce((a, v) => a += v.display + ', ', '');
}

export function newCoding(system = undefined, code = undefined, version = undefined, display = undefined) {
    return {
        code: code,
        display: display,
        system: codeSystemOut(system),
        userSelected: false,
        version: version,
    };
}
