import { FhirReference } from '../../../../shared/mapping/fhir/fhir.model';
import { FhirDomainResource } from '../../../../shared/mapping/fhir/fhirResource.model';

export function asRefString(resource: FhirDomainResource): string {
    return resource.resourceType + '/' + resource.id;
}

export function getRef(ref?: FhirReference<any>): string | undefined {
    return ref ? ref.reference : undefined;
}

export function isRef(ref?: FhirReference<any>): ref is FhirReference<any> {
    return !!getRef(ref);
}

export function isRefType(resourceType: string, ref?: FhirReference<any>): boolean {
    return isRef(ref) && !!ref.reference && ref.reference.startsWith(resourceType + '/');
}

export function newReference(r: string): FhirReference<any> {
    return {
        reference: r
    };
}

export function parseRef(ref?: FhirReference<any>, resourceType?: string): string[] {
    if (resourceType && isRefType(resourceType, ref) || !resourceType && isRef(ref)) {
        let delim = ref!.reference!.indexOf('/');
        if (delim > 0) {
            return [ref!.reference!.substr(0, delim), ref!.reference!.substr(delim + 1)];
        }
    }
    return [];
}

export function toRef(resource: FhirDomainResource): FhirReference<any> {
    return newReference(asRefString(resource));
}