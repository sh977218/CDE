import { FhirCoding, FhirValue } from 'shared/mapping/fhir/fhir.model';
import { FhirDomainResource } from 'shared/mapping/fhir/fhirResource.model';

declare function codingArrayPreview(codings: FhirCoding[]): string;
declare function getDateString(resource: FhirDomainResource, periodName?: string, dateTimeName?: string, instanceName?: string): string;
declare function valuePreview(container: FhirValue, prefix?: string): string;
