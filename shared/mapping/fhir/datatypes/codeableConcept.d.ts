import { FhirCodeableConcept, FhirCoding } from 'shared/mapping/fhir/fhir.model';

declare function getText(concept: FhirCodeableConcept): string;
declare function newCodeableConcept(coding: FhirCoding[], text?: string): FhirCodeableConcept;
declare function reduce<T>(concept: FhirCodeableConcept, codingCb: (a: T, c: FhirCoding) => T, initialValue: T);
