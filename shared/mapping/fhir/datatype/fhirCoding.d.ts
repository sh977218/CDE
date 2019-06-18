import { FhirCoding } from 'shared/mapping/fhir/fhir.model';

export function getText(coding?: FhirCoding): string;
export function getTextFromArray(coding?: FhirCoding[]): string;
export function getTextFromArrayAll(coding?: FhirCoding[]): string;
declare function newCoding(system?: string, code?: string, version?: string, display?: string): FhirCoding;
