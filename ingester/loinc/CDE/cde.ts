import { generateTinyId } from 'server/system/mongo-data';
import { parseClassification } from 'ingester/loinc/Shared/ParseClassification';
import { parseDefinitions } from 'ingester/loinc/Shared/ParseDefinitions';
import { parseDesignations } from 'ingester/loinc/Shared/ParseDesignations';
import { parseIds } from 'ingester/loinc/Shared/ParseIds';
import { parseProperties } from 'ingester/loinc/Shared/ParseProperties';
import { parseReferenceDocuments } from 'ingester/loinc/Shared/ParseReferenceDocuments';
import { parseStewardOrg } from 'ingester/loinc/Shared/ParseStewardOrg';
import { parseSources } from 'ingester/loinc/Shared/ParseSources';
import { parseConcepts } from 'ingester/loinc/CDE/ParseConcept';
import { parseValueDomain } from 'ingester/loinc/CDE/ParseValueDomain';

import { transferClassifications } from 'shared/system/classificationShared';
import { mergeBySource } from 'ingester/loinc/Shared/mergeBySource';
import { mergeBySourceName } from 'ingester/loinc/Shared/mergeBySourceName';
import { mergeDefinitions } from 'ingester/loinc/Shared/mergeDefinitions';
import { mergeDesignations } from 'ingester/loinc/Shared/mergeDesignations';
import { diff as deepDiff } from 'deep-diff';
import { cloneDeep } from 'lodash';
import { wipeUseless } from 'ingester/loinc/Shared/wipeUseless';
import { created, imported } from 'ingester/shared/utility';

export async function createCde(element, orgInfo) {
    let loinc = element.loinc ? element.loinc : element;
    let designations = parseDesignations(loinc, element);
    let definitions = parseDefinitions(loinc);
    let ids = parseIds(loinc);
    let properties = parseProperties(loinc);
    let referenceDocuments = parseReferenceDocuments(loinc);
    let valueDomain = parseValueDomain(loinc);
    let concepts = parseConcepts(loinc);
    let stewardOrg = parseStewardOrg(orgInfo);
    let sources = parseSources(loinc);
    let classification = await parseClassification(loinc, orgInfo);

    return {
        tinyId: generateTinyId(),
        createdBy: {username: 'batchloader'},
        created,
        imported,
        registrationState: {registrationStatus: "Standard"},
        sources: sources,
        designations,
        definitions,
        ids,
        properties,
        referenceDocuments,
        objectClass: {concepts: concepts.objectClass},
        property: {concepts: concepts.property},
        dataElementConcept: {concepts: concepts.dataElementConcept},
        stewardOrg,
        valueDomain,
        classification
    };
}

export function mergeCde(newCde, existingCde) {
    existingCde.designations = mergeDesignations(existingCde.designations, newCde.designations);
    existingCde.definitios = mergeDefinitions(existingCde.definitions, newCde.definitions);
    existingCde.sources = mergeBySourceName(existingCde.sources, newCde.sources);

    existingCde.mappingSpecifications = newCde.mappingSpecifications;
    existingCde.referenceDocuments = mergeBySource(existingCde.referenceDocuments, newCde.referenceDocuments);
    existingCde.properties = mergeBySource(existingCde.properties, newCde.properties);
    existingCde.ids = mergeBySource(existingCde.ids, newCde.ids);

    existingCde.property = newCde.property;
    existingCde.valueDomain = newCde.valueDomain;

    transferClassifications(newCde, existingCde);
}

export function compareCde(newCde, existingCde) {
    let newCdeObj = cloneDeep(newCde);
    if (newCdeObj.toObject) newCdeObj = newCdeObj.toObject();
    let existingCdeObj = cloneDeep(existingCde);
    if (existingCdeObj.toObject) existingCdeObj = existingCdeObj.toObject();

    [existingCdeObj, newCdeObj].forEach(obj => {
        obj.designations.sort((a, b) => a.designation >= b.designation);
        obj.definitions.sort((a, b) => a.definition >= b.definition);
        obj.ids.sort((a, b) => a.source >= b.source);
        obj.referenceDocuments.sort((a, b) => a.docType >= b.docType);
        obj.properties.sort((a, b) => a.key >= b.key);

        wipeUseless(obj);

        if (!obj.valueDomain.uom) delete obj.valueDomain.uom;

        ['properties', 'referenceDocuments', 'ids'].forEach(p => {
            obj[p] = obj[p].filter(a => a.source === 'LOINC')
        })
    });
    return deepDiff(existingCdeObj, newCdeObj);
}