import { ResourceTree } from '_fhirApp/resourceTree';
import { supportedFhirResources } from 'shared/models.model';
import { CdeForm, FhirProcedureMapping, FormElement, FormQuestion } from 'shared/form/form.model';
import { getMapToFhirResource } from 'shared/form/formAndFe';
import { codeSystemOut } from 'shared/mapping/fhir';
import { FhirDomainResource, FhirEncounter, FhirObservation, FhirProcedure } from 'shared/mapping/fhir/fhirResource.model';
import { newEncounter } from 'shared/mapping/fhir/resource/fhirEncounter';
import { newObservation } from 'shared/mapping/fhir/resource/fhirObservation';
import { newProcedure } from 'shared/mapping/fhir/resource/fhirProcedure';

export function addEmptyNode(fe: FormElement | CdeForm, cb, parent: ResourceTree) {
    let self = addNode(parent, undefined, fe);
    cb(undefined, self);
    return self;
}

function addNode(parent: ResourceTree, resource?: FhirDomainResource, fe?: FormElement|CdeForm, resourceType?: string): ResourceTree {
    let node: ResourceTree = {children: []};
    ResourceTree.setCrossReference(node, fe);
    if (resource) {
        ResourceTree.setResource(node, resource);
    } else if (getMapToFhirResource(fe)) {
    } else if (fe && fe.elementType === 'question') {
        if (parent.resourceType === 'Observation') {
            node.parentAttribute = 'component';
        } else if (parent.resourceType === 'Procedure') {
            if (parent.map) {
                let q = fe as FormQuestion;
                let [prop] = getMapPropertyFromId(parent.map, (fe as FormQuestion).question.cde.tinyId);
                if (prop) {
                    node.parentAttribute = prop.property;
                }
            }
        } else {
            node.resourceType = fhirTypes.get(parent.resourceType).child;
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

export let compareCodingId = (a, b) => a['system'] === codeSystemOut(b['source']) && a['code'] === b['id'];

export type FhirMappedRegularTypes = 'FhirAnnotation'|'FhirCodeableConcept'|'FhirReference'|'code';
export type FhirMapped = { type: 'backbone', property: string, properties: any, min: number, max: number, default?: any, mapFieldId: string, mapFieldValue?: string }
    | { type: 'choiceType', property: string, properties: any, min: number, max: number, default?: any, mapFieldId: string, mapFieldValue?: string }
    | { type: FhirMappedRegularTypes, property: string, min: number, max: number, default?: any, subTypes: string[], mapFieldId: string, mapFieldValue?: string };

function getQuestionRefs(map: any, procedureMapping?: FhirProcedureMapping): [FhirMapped[], string[]] {
    if (!procedureMapping) {
        return [[], []];
    }
    return [
        map.mappedProperties.concat(),
        map.mappedProperties.map(p => procedureMapping[p.mapFieldId])
    ];
}

export class FhirProcedureMap {
    // static commonProperties = [ 'code', 'context', 'identifier', 'subject' ];
    static resourceName: supportedFhirResources = 'Procedure';
    static readonly mappedProperties: FhirMapped[] = [
        {property: 'bodySite', type: 'FhirCodeableConcept', subTypes: ['http://hl7.org/fhir/ValueSet/body-site'], min: 0, max: -1, mapFieldId: 'bodySiteQuestionID', mapFieldValue: 'bodySiteCode'},
        {property: 'code', type: 'FhirCodeableConcept', subTypes: ['http://hl7.org/fhir/ValueSet/procedure-code'], min: 0, max: 1, mapFieldId: 'procedureQuestionID', mapFieldValue: 'procedureCode'},
        {property: 'complication', type: 'FhirCodeableConcept', subTypes: ['http://hl7.org/fhir/ValueSet/condition-code'], min: 0, max: -1, mapFieldId: 'complications'},
        {property: 'performed', type: 'choiceType', properties: ['dateTime', 'Period'], min: 0, max: 1, mapFieldId: 'performedDate'},
        {property: 'status', type: 'code', subTypes: ['http://hl7.org/fhir/ValueSet/event-status'], min: 1, max: 1, default: 'unknown', mapFieldId: 'statusQuestionID', mapFieldValue: 'statusStatic'},
        {property: 'usedReference', type: 'FhirReference', subTypes: ['Device', 'Medication', 'Substance'], min: 0, max: -1, mapFieldId: 'usedReferences'}
    ];
    questionProperties: FhirMapped[];
    questionIds: string[];
    mapping: FhirProcedureMapping;
    static: any = FhirProcedureMap;

    constructor(procedureMapping: FhirProcedureMapping) {
        this.mapping = procedureMapping;
        [this.questionProperties, this.questionIds] = getQuestionRefs(FhirProcedureMap, procedureMapping);
    }
}

export type supportedResourcesMaps = FhirProcedureMap;

export const fhirTypes = new Map<string, {self: Object, child: string | undefined, create: Function | null, map: any}>();
fhirTypes.set('bundle', {self: undefined, child: 'Observation', create: undefined, map: undefined});
fhirTypes.set('Encounter', {self: FhirEncounter, child: 'Observation', create: newEncounter, map: undefined});
fhirTypes.set('Observation', {self: FhirObservation, child: undefined, create: newObservation, map: undefined});
fhirTypes.set('Procedure', {self: FhirProcedure, child: undefined, create: newProcedure, map: FhirProcedureMap});

export const resourceMap: any = {};
resourceMap['Procedure'] = FhirProcedureMap;

export function getMapPropertyFromId(map: supportedResourcesMaps, id: string): [FhirMapped, string] {
    if (!map || !map.questionIds) {
        return [undefined, undefined];
    }
    let i = map.questionIds.indexOf(id);
    return i > -1 ? [map.questionProperties[i], map.questionIds[i]] : [undefined, undefined];
}

export function getMapPropertyFromName(map: supportedResourcesMaps, name: string): [FhirMapped, string] {
    let propertyMapped = map.questionProperties.filter(m => m.property === name)[0];
    if (!propertyMapped) {
        return [undefined, undefined];
    }
    return [propertyMapped, map.questionIds[map.questionProperties.indexOf(propertyMapped)]];
}
