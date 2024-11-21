import {generateTinyId} from 'server/system/mongo-data';
import {BATCHLOADER, created, imported, lastMigrationScript} from 'ingester/shared/utility';
import {classifyItem} from 'server/classification/orgClassificationSvc';
import {DEFAULT_LOADER_CONFIG} from 'ingester/general/shared/utility';

import {parseDesignations} from 'ingester/general/cde/ParseDesignations';
import {parseDefinitions} from 'ingester/general/cde/ParseDefinitions';
import {parseSources} from 'ingester/general/cde/ParseSources';
import {parseIds} from 'ingester/general/cde/ParseIds';
import {parseValueDomain} from 'ingester/general/cde/ParseValueDomain';
import {parseClassification} from 'ingester/general/cde/ParseClassification';
import {parseConcepts} from 'ingester/general/cde/ParseConcept';
import {parseProperties} from 'ingester/general/cde/ParseProperties';


export async function createCde(row: any) {
    const designations = parseDesignations(row);
    const definitions = parseDefinitions(row);
    const sources = parseSources();
    const ids = parseIds(row);
    const valueDomain = await parseValueDomain(row);
    const concepts = parseConcepts(row);
    // const origin = parseOrigin(row);
    const properties = parseProperties(row);
    // const referenceDocuments = parseReferenceDocuments(row);
    const newCde: any = {
        tinyId: generateTinyId(),
        nihEndorsed: DEFAULT_LOADER_CONFIG.endorsed,
        stewardOrg: {
            name: DEFAULT_LOADER_CONFIG.stewardOrg
        },
        registrationState: {
            registrationStatus: DEFAULT_LOADER_CONFIG.registrationStatus,
            administrativeStatus: DEFAULT_LOADER_CONFIG.administrativeStatus
        },
        createdBy: BATCHLOADER,
        changeNote: lastMigrationScript,
        created,
        imported,
        properties,
        sources,
        designations,
        definitions,
        // origin,
        // referenceDocuments,
        dataElementConcept: concepts ? {concepts: concepts.dataElementConcept} : null,
        valueDomain,
        attachments: [],
        ids,
        classification: []
    };
    parseClassification(newCde, row);
    if (newCde.classification.length === 0) {
        classifyItem(newCde, DEFAULT_LOADER_CONFIG.classificationOrgName, ['Not Classified']);
    }
    return newCde;
}
