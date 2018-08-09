import { FhirCoding, FhirValue } from 'shared/mapping/fhir/fhir.model';

declare function codingArrayPreview(codings: FhirCoding[]): string;
declare function valuePreview(container: FhirValue, prefix?: string): string;
