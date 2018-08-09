import { CdeForm } from 'shared/form/form.model';

export function getMapToFhirResource(elt) {
    return elt && isMappedTo(elt, 'fhir') ? elt.mapTo.fhir.resourceType : undefined;
}

export function isMappedTo(f, systemOrProtocol) {
    return !!f.mapTo && !!f.mapTo[systemOrProtocol];
}
