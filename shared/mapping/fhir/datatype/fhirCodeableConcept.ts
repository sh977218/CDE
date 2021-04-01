import { reduce as reduceArray } from 'shared/array';
import { FhirCodeableConcept, FhirCoding } from 'shared/mapping/fhir/fhir.model';
import { getTextFromArray as codingGetTextFromArray } from 'shared/mapping/fhir/datatype/fhirCoding';

export function getText(concept?: FhirCodeableConcept): string {
    return concept && (concept.text || codingGetTextFromArray(concept.coding)) || '';
}

export function getTextFromArray(conceptArray?: FhirCodeableConcept[]): string {
    return Array.isArray(conceptArray) ? conceptArray.map(getText).join(', ') : '';
}

export function newCodeableConcept(coding: FhirCoding[], text?: string): FhirCodeableConcept {
    if (!text && Array.isArray(coding)) {
        coding.some(c => {
            if (c.display) {
                text = c.display;
                return true;
            }
            return false;
        });
    }
    return {coding, text};
}

export function reduce<T>(concept: FhirCodeableConcept, codingCb: (a: T, c: FhirCoding) => T, initialValue: T): T {
    return concept.coding ? reduceArray(concept.coding, codingCb, initialValue) : initialValue;
}
