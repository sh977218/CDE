import { FhirReference } from 'shared/mapping/fhir/fhir.model';
import { FhirDomainResource } from 'shared/mapping/fhir/fhirResource.model';

declare function asRefString(resource: FhirDomainResource): string;
declare function getRef(ref?: FhirReference<any>): string;
declare function isRef(ref?: FhirReference<any>): boolean;
declare function isRefType(resourceType: string, ref?: FhirReference<any>): boolean;
declare function newReference(ref: string): FhirReference<any>;
declare function parseRef(ref?: FhirReference<any>, resourceType?: string): string[];
declare function toRef(resource: FhirDomainResource): FhirReference<any>;
