import {
    ResourceTree, ResourceTreeAttribute, ResourceTreeIntermediate, ResourceTreeResource, ResourceTreeRoot,
    ResourceTreeUtil
} from './resourceTree';
import { getMapToFhirResource } from 'core/form/formAndFe';
import { isQuestion } from 'shared/form/fe';
import { CdeForm, FhirProcedureMapping, FormElement } from 'shared/form/form.model';
import { isCdeFormNotFe } from 'shared/item';
import { assertThrow, assertUnreachable, CbErr1, CdeId } from 'shared/models.model';
import { codeSystemOut } from 'shared/mapping/fhir';
import { FhirCoding } from 'shared/mapping/fhir/fhir.model';
import { supportedFhirResources } from 'shared/mapping/fhir/fhirResource.model';
import { isArray, isUndefined } from 'util';

export function addEmptyNode(fe: FormElement | CdeForm, cb: CbErr1<ResourceTreeRoot|ResourceTree|undefined>,
                             parent: ResourceTreeRoot|ResourceTreeResource|ResourceTreeIntermediate
): ResourceTreeRoot | ResourceTree | undefined {
    let self: ResourceTreeRoot | ResourceTree | undefined;
    if (isUndefined(parent) || ResourceTreeUtil.isRoot(parent)) {
        self = addRootNode(fe, parent, undefined,
            parent && ResourceTreeUtil.isNotRoot(parent) && ResourceTreeUtil.isResource(parent) ? parent.childResourceType : undefined);
    } else {
        self = addNode(fe, parent);
    }
    cb(undefined, self);
    return self;
}

export function addRootNode(fe: FormElement|CdeForm, parent?: ResourceTreeRoot|ResourceTreeResource, resource?: any,
                            resourceType?: supportedFhirResources): ResourceTreeRoot|ResourceTreeResource {
    if (isUndefined(parent) || ResourceTreeUtil.isRoot(parent)) {
        let node: ResourceTreeRoot|ResourceTree;
        if (resource) {
            node = ResourceTreeUtil.createResource(resource.resourceType, fe, resource);
        } else if (getMapToFhirResource(fe)) {
            node = ResourceTreeUtil.createResource(undefined, fe);
        } else if (fe && fe.elementType === 'question') {
            node = ResourceTreeUtil.createResource('Observation', fe);
        } else if (resourceType) {
            node = ResourceTreeUtil.createResource(resourceType, fe);
        } else {
            node = ResourceTreeUtil.createRoot(fe, parent);
        }
        if (parent) {
            parent.children.push(node);
        }
        return node;
    } else {
        throw assertThrow();
    }
}

function addNode(fe: FormElement|CdeForm, parent: ResourceTreeResource|ResourceTreeIntermediate): ResourceTree|undefined {
    let node;
    if (!isCdeFormNotFe(fe) && !isQuestion(fe)) {
        if (parent.resourceType === 'QuestionnaireResponse') {
            node = ResourceTreeUtil.createIntermediate(parent, fe);
        }
    } else if (!isCdeFormNotFe(fe) && isQuestion(fe)) {
        switch (parent.root.resourceType) {
            case 'Observation':
                node = ResourceTreeUtil.createAttritube(parent, 'component', fe);
                break;
            case 'Procedure':
                if (parent.root.map) {
                    const [prop] = getMapPropertyFromId(fe.question.cde.tinyId, parent.root.map);
                    if (prop) {
                        node = ResourceTreeUtil.createAttritube(parent, prop.property, fe);
                    }
                }
                break;
            case 'QuestionnaireResponse':
                node = ResourceTreeUtil.createAttritube(parent, 'item', fe);
                break;
            default:
                throw assertUnreachable(parent.root.resourceType);
                // let fhirType = parent.resourceType && fhirTypes.get(parent.resourceType);
                // node.resourceType = fhirType ? fhirType.child : undefined;
        }
    }
    if (node) {
        parent.children.push(node);
        return node;
    }
    return undefined;
}

export function setResourceAndUpdateParentResource(self: ResourceTreeIntermediate|ResourceTreeAttribute,
                                                   attribute: string, resource: any): any {
    ResourceTreeUtil.setResource(self, resource);
    if (!isArray(self.parent.resource[attribute])) {
        self.parent.resource[attribute] = [];
    }
    self.parent.resource[attribute].push(resource);
    return resource;
}

export let compareCodingId = (a: FhirCoding, b: CdeId) => a.system === codeSystemOut(b.source) && a.code === b.id;

export type FhirMappedRegularTypes = 'FhirAnnotation'|'FhirCodeableConcept'|'FhirReference'|'code';
export type FhirMapped = { type: 'backbone', property: string, properties: any, min: number, max: number, default?: any,
        mapFieldId: string, mapFieldValue?: string }
    | { type: 'choiceType', property: string, properties: any, min: number, max: number, default?: any, mapFieldId: string,
    mapFieldValue?: string }
    | { type: FhirMappedRegularTypes, property: string, min: number, max: number, default?: any, subTypes: string[],
    mapFieldId: string, mapFieldValue?: string };

function getQuestionRefs(map: any, procedureMapping?: FhirProcedureMapping): [FhirMapped[], string[]] {
    if (!procedureMapping) {
        return [[], []];
    }
    return [
        map.mappedProperties.concat(),
        map.mappedProperties.map((p: FhirMapped) => procedureMapping[p.mapFieldId])
    ];
}

export class FhirProcedureMap {
    questionProperties: FhirMapped[];
    questionIds: string[];
    mapping: FhirProcedureMapping;
    static: any = FhirProcedureMap;

    constructor(procedureMapping: FhirProcedureMapping) {
        this.mapping = procedureMapping;
        [this.questionProperties, this.questionIds] = getQuestionRefs(FhirProcedureMap, procedureMapping);
    }

    // static commonProperties = [ 'code', 'context', 'identifier', 'subject' ];
    // static resourceName: supportedFhirResources = 'Procedure';
    static readonly mappedProperties: FhirMapped[] = [
        {property: 'bodySite', type: 'FhirCodeableConcept', subTypes: ['http://hl7.org/fhir/ValueSet/body-site'], min: 0, max: -1,
            mapFieldId: 'bodySiteQuestionID', mapFieldValue: 'bodySiteCode'},
        {property: 'code', type: 'FhirCodeableConcept', subTypes: ['http://hl7.org/fhir/ValueSet/procedure-code'], min: 0, max: 1,
            mapFieldId: 'procedureQuestionID', mapFieldValue: 'procedureCode'},
        {property: 'complication', type: 'FhirCodeableConcept', subTypes: ['http://hl7.org/fhir/ValueSet/condition-code'], min: 0, max: -1,
            mapFieldId: 'complications'},
        {property: 'performed', type: 'choiceType', properties: ['dateTime', 'Period'], min: 0, max: 1,
            mapFieldId: 'performedDate'},
        {property: 'status', type: 'code', subTypes: ['http://hl7.org/fhir/ValueSet/event-status'], min: 1, max: 1, default: 'unknown',
            mapFieldId: 'statusQuestionID', mapFieldValue: 'statusStatic'},
        {property: 'usedReference', type: 'FhirReference', subTypes: ['Device', 'Medication', 'Substance'], min: 0, max: -1,
            mapFieldId: 'usedReferences'}
    ];
}

export type supportedResourcesMaps = FhirProcedureMap;

// export const fhirTypes = new Map<string, {self: Object|undefined, child: supportedFhirResources|undefined,
//                                           create: Function|undefined, map: any}>();
// fhirTypes.set('bundle', {self: undefined, child: 'Observation', create: undefined, map: undefined});
// fhirTypes.set('Encounter', {self: FhirEncounter, child: 'Observation', create: newEncounter, map: undefined});
// fhirTypes.set('Observation', {self: FhirObservation, child: undefined, create: newObservation, map: undefined});
// fhirTypes.set('Procedure', {self: FhirProcedure, child: undefined, create: newProcedure, map: FhirProcedureMap});

export const resourceMap: any = {};
resourceMap.Procedure = FhirProcedureMap;

export function getMapPropertyFromId(id: string, map?: supportedResourcesMaps): [FhirMapped|undefined, string|undefined] {
    if (!map || !map.questionIds) {
        return [undefined, undefined];
    }
    const i = map.questionIds.indexOf(id);
    return i > -1 ? [map.questionProperties[i], map.questionIds[i]] : [undefined, undefined];
}

export function getMapPropertyFromName(map: supportedResourcesMaps, name: string): [FhirMapped|undefined, string|undefined] {
    const propertyMapped = map.questionProperties.filter(m => m.property === name)[0];
    if (!propertyMapped) {
        return [undefined, undefined];
    }
    return [propertyMapped, map.questionIds[map.questionProperties.indexOf(propertyMapped)]];
}
