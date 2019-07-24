import { resourceMap, supportedResourcesMaps } from '_fhirApp/resources';
import { getFhirResourceMap, getMapToFhirResource } from 'core/form/formAndFe';
import { assertUnreachable } from 'shared/models.model';
import { CdeForm, FormElement } from 'shared/form/form.model';
import { toRef } from 'shared/mapping/fhir/datatype/fhirReference';
import { FhirDomainResource, supportedFhirResources } from 'shared/mapping/fhir/fhirResource.model';
import { deepCopy } from 'shared/system/util';

export type contextTypes = 'Encounter'|'EpisodeOfCare';
export const contextTypesArray = ['Encounter', 'EpisodeOfCare'];

export interface ResourceTreeRoot {
    crossReference?: any;
    children: (ResourceTreeRoot|ResourceTreeResource)[];
    parent?: ResourceTreeRoot;
}
export interface ResourceTreeResource {
    resourceType: supportedFhirResources;
    children: ResourceTree[];
    childResourceType?: supportedFhirResources;
    crossReference?: any;
    map?: supportedResourcesMaps;
    lookupResource?: any;
    resource?: any;
    resourceRemote?: any;
    root: ResourceTreeResource;
}
export interface ResourceTreeIntermediate {
    resourceType: undefined;
    children: ResourceTree[];
    crossReference?: any;
    parent: ResourceTreeResource|ResourceTreeIntermediate;
    resource?: any;
    root: ResourceTreeResource;
}
export interface ResourceTreeAttribute {
    resourceType: undefined;
    crossReference?: any;
    parent: ResourceTreeResource|ResourceTreeIntermediate;
    parentAttribute: string;
    resource?: any;
    root: ResourceTreeResource;
}
export type ResourceTree = ResourceTreeResource | ResourceTreeIntermediate | ResourceTreeAttribute;

export class ResourceTreeUtil {
    static createAttritube(parent: ResourceTreeResource|ResourceTreeIntermediate, parentAttribute: string, fe?: CdeForm|FormElement, resource?: FhirDomainResource): ResourceTreeAttribute {
        const node: ResourceTreeAttribute = {parent, parentAttribute, resourceType: undefined, root: parent.root};
        if (fe) { ResourceTreeUtil.setCrossReference(node, fe); }
        if (resource) { ResourceTreeUtil.setResource(node, resource); }
        return node;
    }

    static createIntermediate(parent: ResourceTreeResource|ResourceTreeIntermediate, fe?: CdeForm|FormElement, resource?: FhirDomainResource) {
        const node: ResourceTreeIntermediate = {children: [], parent, resourceType: undefined, root: parent.root};
        if (fe) { ResourceTreeUtil.setCrossReference(node, fe); }
        if (resource) { ResourceTreeUtil.setResource(node, resource); }
        return node;
    }

    static createResource(resourceType: supportedFhirResources|undefined, fe?: CdeForm|FormElement,
                          resource?: FhirDomainResource): ResourceTreeResource {
        const partial: any = {children: [], resourceType};
        partial.root = partial;
        const node: ResourceTreeResource = partial;
        if (fe) { ResourceTreeUtil.setCrossReference(node, fe); }
        if (resource) { ResourceTreeUtil.setResource(node, resource); }
        return node;
    }

    static createRoot(fe: CdeForm|FormElement, parent?: ResourceTreeRoot): ResourceTreeRoot {
        return {children: [], crossReference: fe, parent};
    }

    static isRoot(node: ResourceTreeRoot|ResourceTree): node is ResourceTreeRoot {
        return !node.hasOwnProperty('resourceType');
    }

    static isNotRoot(node: ResourceTreeRoot|ResourceTree): node is ResourceTree {
        return node.hasOwnProperty('resourceType');
    }

    static isResource(node: ResourceTree): node is ResourceTreeResource {
        return !!node.resourceType && !ResourceTreeUtil.isIntermediate(node);
    }

    static isFhirResource(node: ResourceTree): node is ResourceTreeResource {
        return !!getMapToFhirResource(node.crossReference);
    }

    static isIntermediate(node: ResourceTree): node is ResourceTreeIntermediate {
        return node.resourceType === undefined && !node.hasOwnProperty('parentAttribute');
    }

    static isAttribute(node: ResourceTree): node is ResourceTreeAttribute {
        return node.hasOwnProperty('parentAttribute');
    }

    static recurse(node: ResourceTree, parent: ResourceTree, action: Function) {
        action(node, parent);
        if (ResourceTreeUtil.isResource(node)) {
            node.children.forEach(c => ResourceTreeUtil.recurse(c, node, action));
        }
    }

    static setCrossReference(node: ResourceTree, fe: CdeForm|FormElement) {
        node.crossReference = fe;
        node.resourceType = getMapToFhirResource(fe) || node.resourceType;
        if (ResourceTreeUtil.isResource(node)) {
            const map = resourceMap[node.resourceType];
            if (map) {
                node.map = new map(getFhirResourceMap(fe));
            }
        }
    }

    static setResource(node: ResourceTree, resource: any, resourceAfter?: any) {
        if (ResourceTreeUtil.isResource(node)) {
            if (!resourceAfter) { resourceAfter = deepCopy(resource); }
            node.resource = resourceAfter;
            node.resourceRemote = resource;
            if (!(node.resource instanceof Promise)) {
                node.resourceType = resourceAfter.resourceType;
                node.children.forEach(c => ResourceTreeUtil.recurse(c, node, ResourceTreeUtil.updateContext));
            }
        } else {
            node.resource = resource;
        }
    }

    static updateContext(node: ResourceTree, parent: ResourceTree) {
        if (ResourceTreeUtil.isResource(node) && node.resource && node.resource.resourceType) {
            switch (node.resourceType) {
                case 'Observation':
                case 'Procedure':
                case 'QuestionnaireResponse':
                    if (parent.resource && contextTypesArray.indexOf(parent.resource.resourceType) > -1 && parent.resource.id) {
                        node.resource.context = toRef(parent.resource);
                    }
                    break;
                default:
                    assertUnreachable(node.resourceType);
            }
        }
    }
}
