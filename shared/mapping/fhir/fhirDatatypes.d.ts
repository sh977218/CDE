import { FormElement } from 'shared/form/form.model';
import { FhirCoding, FhirReference } from 'shared/mapping/fhir/fhir.model';

declare function codeSystemIn(uri): string;
declare function codeSystemOut(system: string, fe?: FormElement): string;
declare function codingArrayPreview(codings: FhirCoding[]): string;
declare function newReference(ref: string): FhirReference<any>;
declare function valuePreview(container: any, prefix?: string): string;
