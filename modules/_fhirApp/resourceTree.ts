import { CdeForm } from 'shared/form/form.model';
import {
    FhirDomainResource, FhirEncounter, FhirObservation, FhirProcedure
} from 'shared/mapping/fhir/fhirResource.model';
import { toRef } from 'shared/mapping/fhir/datatype/fhirReference';
import { newEncounter } from 'shared/mapping/fhir/resource/fhirEncounter';
import { newObservation } from 'shared/mapping/fhir/resource/fhirObservation';
import { newProcedure } from 'shared/mapping/fhir/resource/fhirProcedure';
import { deepCopy } from 'shared/system/util';

export const types = new Map<string, {self: Object, child: string | undefined, create: Function | null}>();
types.set('Encounter', {self: FhirEncounter, child: 'Observation', create: newEncounter});
types.set('Observation', {self: FhirObservation, child: undefined, create: newObservation});
types.set('Procedure', {self: FhirProcedure, child: undefined, create: newProcedure});

export class ResourceTree {
    children: ResourceTree[] = [];
    crossReference?: any;
    parentAttribute?: string;
    resource?: any;
    resourceRemote?: any;
    resourceType?: string;

    constructor(resource: FhirDomainResource, fe?: CdeForm) {
        this.crossReference = fe;
        this.resource = resource;
        this.resourceType =  resource.resourceType;
    }

    static recurse(node: ResourceTree, parent: ResourceTree, action: Function) {
        action(node, parent);
        node.children.forEach(c => ResourceTree.recurse(c, node, action));
    }

    static setResource(node: ResourceTree, resource, resourceAfter?) {
        if (!resourceAfter) resourceAfter = deepCopy(resource);
        node.parentAttribute = undefined;
        node.resource = resourceAfter;
        node.resourceRemote = resource;
        node.resourceType = resourceAfter.resourceType;
        node.children.forEach(c => ResourceTree.recurse(c, node, ResourceTree.updateParentRef));
    }

    static setResourceNonFhir(node: ResourceTree, resource, parentAttribute) {
        node.parentAttribute = parentAttribute;
        node.resource = resource;
        node.resourceRemote = undefined;
        node.resourceType = null;
    }

    static updateParentRef(node: ResourceTree, parent: ResourceTree) {
        if (!node.resource || !node.resource.resourceType) {
            return;
        }
        switch (node.resource.resourceType) {
            case 'Observation':
            case 'Procedure':
                if (parent.resource && parent.resource.resourceType && parent.resource.id) {
                    node.resource.context = toRef(parent.resource);
                }
                break;
            default:
                throw new Error('Error: update parent ref');
        }
    }
}