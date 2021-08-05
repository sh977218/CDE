import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported, lastMigrationScript } from 'ingester/shared/utility';
import { classifyItem } from 'server/classification/orgClassificationSvc';
import { DEFAULT_RADX_CONFIG } from 'ingester/radx/shared/utility';

import { parseDesignations } from 'ingester/radx/cde/ParseDesignations';
import { parseDefinitions } from 'ingester/radx/cde/ParseDefinitions';
import { parseSources } from 'ingester/radx/cde/ParseSources';
import { parseIds } from 'ingester/radx/cde/ParseIds';
import { parseValueDomain } from 'ingester/radx/cde/ParseValueDomain';
import { parseClassification } from 'ingester/radx/cde/ParseClassification';
import { parseConcepts } from 'ingester/radx/cde/ParseConcept';
import { parseOrigin } from 'ingester/radx/cde/ParseOrigin';
import { parseProperties } from 'ingester/radx/cde/ParseProperties';
import { parseReferenceDocuments } from 'ingester/radx/cde/ParseReferenceDocuments';


export async function createCde(row: any) {
    const designations = parseDesignations(row);
    const definitions = parseDefinitions(row);
    const sources = parseSources();
    const ids = parseIds(row);
    const valueDomain = await parseValueDomain(row);
    const concepts = parseConcepts(row);
    const origin = parseOrigin(row);
    const properties = parseProperties(row);
    const referenceDocuments = parseReferenceDocuments(row);
    const radxCde: any = {
        tinyId: generateTinyId(),
        stewardOrg: {
            name: DEFAULT_RADX_CONFIG.stewardOrg
        },
        registrationState: {
            registrationStatus: DEFAULT_RADX_CONFIG.registrationStatus
        },
        createdBy: BATCHLOADER,
        changeNote: lastMigrationScript,
        created,
        imported,
        properties,
        sources,
        designations,
        definitions,
        origin,
        referenceDocuments,
        dataElementConcept: concepts ? {concepts: concepts.dataElementConcept} : null,
        valueDomain,
        attachments: [],
        ids,
        classification: []
    };
    parseClassification(radxCde, row);
    if (radxCde.classification.length === 0) {
        classifyItem(radxCde, DEFAULT_RADX_CONFIG.classificationOrgName, ['Not Classified']);
    }
    return radxCde;
}