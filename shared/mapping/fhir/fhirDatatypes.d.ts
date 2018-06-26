import { FormElement } from 'shared/form/form.model';
import { FhirCoding, FhirReference, FhirValue } from 'shared/mapping/fhir/fhir.model';
import { FhirDomainResource } from 'shared/mapping/fhir/fhirResource.model';

declare function codeSystemIn(uri): string;
declare function codeSystemOut(system: string, fe?: FormElement): string;
declare function codingArrayPreview(codings: FhirCoding[]): string;
declare function getRef(resource: FhirDomainResource): string;
declare function newReference(ref: string): FhirReference<any>;
declare function valuePreview(container: FhirValue, prefix?: string): string;
