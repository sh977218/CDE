import { FhirCoding } from '../../../../shared/mapping/fhir/fhir.model';
import { codeSystemOut } from '../../../../shared/mapping/fhir';

export function getText(coding?: FhirCoding): string {
    return coding && coding.display ? coding.display : '';
}

export function getTextFromArray(coding?: FhirCoding[]): string {
    if (Array.isArray(coding)) {
        let display = coding.filter(c => !!c.display);
        if (display.length) {
            return display[0].display!;
        }
    }
    return '';
}

export function getTextFromArrayAll(coding?: FhirCoding[]): string {
    return Array.isArray(coding) ? coding.reduce((a, v) => a += (v.display ? v.display + ', ' : ''), '') : '';
}

export function newCoding(system?: string, code?: string, version?: string, display?: string): FhirCoding {
    return {
        code: code,
        display: display,
        system: codeSystemOut(system),
        userSelected: false,
        version: version,
    };
}