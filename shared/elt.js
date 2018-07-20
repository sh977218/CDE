import { capString } from 'shared/system/util';

export function getMapToFhirResource(elt) {
    return elt && elt.mapTo && elt.mapTo.fhir ? elt.mapTo.fhir.resourceType : undefined;
}

export function getName(elt) {
    if (elt.primaryNameCopy) {
        return elt.primaryNameCopy;
    } else {
        return elt.designations[0].designation;
    }
}
