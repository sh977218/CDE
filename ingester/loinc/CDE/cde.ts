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

import { batchloader, created, imported } from 'ingester/shared/utility';

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
        createdBy: batchloader,
        created,
        imported,
        registrationState: {registrationStatus: "Standard"},
        sources,
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
        classification,
        attachments: []
    };
}
