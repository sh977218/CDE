import { FhirCoding } from 'shared/mapping/fhir/fhir.model';

declare function newCoding(system?: string, code?: string, version?: string, display?: string): FhirCoding;
