import { codeSystemOut } from 'shared/mapping/fhir';

export function getText(coding) {
    return coding && coding.display ? coding.display : '';
}

export function getTextFromArray(coding) {
    if (Array.isArray(coding)) {
        let display = coding.filter(c => !!c.display);
        if (display.length) {
            return display[0].display;
        }
    }
    return '';
}

export function getTextFromArrayAll(coding) {
    return Array.isArray(coding) && coding.reduce((a, v) => a += (v.display ? v.display + ', ' : ''), '');
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
