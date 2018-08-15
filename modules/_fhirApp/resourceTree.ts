import { resourceMap, supportedResourcesMaps } from '_fhirApp/resources';
import { CdeForm, FormElement } from 'shared/form/form.model';
import { getFhirResourceMap, getMapToFhirResource } from 'shared/form/formAndFe';
import { toRef } from 'shared/mapping/fhir/datatype/fhirReference';
import { FhirDomainResource } from 'shared/mapping/fhir/fhirResource.model';
import { deepCopy } from 'shared/system/util';

export class ResourceTree {
    children: ResourceTree[] = [];
    crossReference?: any;
    map?: supportedResourcesMaps;
    parentAttribute?: string;
    resource?: any;
    resourceRemote?: any;
    resourceType?: string;

    constructor(resource: FhirDomainResource, fe?: CdeForm|FormElement) {
        if (fe) ResourceTree.setCrossReference(this, fe);
        if (resource) ResourceTree.setResource(this, resource);
        if (!this.resourceType) this.resourceType = 'bundle';
    }

    static isResource(node: ResourceTree): boolean {
        return !!node.resourceType;
    }

    static recurse(node: ResourceTree, parent: ResourceTree, action: Function) {
        action(node, parent);
        node.children.forEach(c => ResourceTree.recurse(c, node, action));
    }

    static setCrossReference(node: ResourceTree, fe?: CdeForm|FormElement) {
        node.crossReference = fe;
        node.resourceType = getMapToFhirResource(fe);
        let map = resourceMap[node.resourceType];
        if (map) {
            node.map = new map(getFhirResourceMap(fe));
        }
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
