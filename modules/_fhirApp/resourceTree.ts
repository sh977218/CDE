import { CdeForm, FormElement } from 'shared/form/form.model';
import { getTag } from 'shared/form/formAndFe';
import { getRef } from 'shared/mapping/fhir/fhirDatatypes';
import { FhirDomainResource, FhirEncounter, FhirObservation } from 'shared/mapping/fhir/fhirResource.model';
import { newEncounter } from 'shared/mapping/fhir/resource/encounter';
import { newObservation } from 'shared/mapping/fhir/resource/observation';
import { deepCopy } from 'shared/system/util';

export const types = new Map<string, {self: Object, child: string | undefined, create: Function | null}>();
types.set('Encounter', {self: FhirEncounter, child: 'Observation', create: newEncounter});
types.set('Observation', {self: FhirObservation, child: undefined, create: newObservation});

export class ResourceTree {
    children: ResourceTree[];
    crossReference?: any;
    parentAttribute?: string;
    resource?: any;
    resourceRemote?: any;
    resourceType?: string;

    static addNode(parent: ResourceTree, resource?: FhirDomainResource, fe?: FormElement|CdeForm, resourceType?: string): ResourceTree {
        let node: ResourceTree = {children: [], crossReference: fe};
        if (resource) {
            ResourceTree.setResource(node, resource);
        } else if (fe && Array.isArray(fe.tags) && getTag(fe, 'fhir')) {
            let tag = getTag(fe, 'fhir');
            if (tag && tag.value.resourceType) {
                node.resourceType = tag.value.resourceType;
            }
        } else if (fe && fe.elementType === 'question') {
            if (parent.resourceType === 'Observation') {
                node.parentAttribute = 'component';
            } else {
                node.resourceType = types.get(parent.resourceType).child;
            }
        } else if (resourceType) {
            node.resourceType = resourceType;
        }

        if (node.resourceType || node.parentAttribute) {
            parent.children.push(node);
            return node;
        } else {
            return parent;
        }
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
                if (parent.resource && parent.resource.resourceType && parent.resource.id) {
                    node.resource.context = getRef(parent.resource);
                }
                break;
            default:
                throw new Error('Error: update parent ref');
        }
    }
}