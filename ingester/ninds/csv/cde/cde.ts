import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported } from 'ingester/shared/utility';

import { parseProperties } from 'ingester/ninds/csv/cde/ParseProperties';
import { parseIds, parseNhlbiIds } from 'ingester/ninds/csv/cde/ParseIds';
import { parseNhlbiValueDomain, parseValueDomain } from 'ingester/ninds/csv/cde/ParseValueDomain';
import { parseReferenceDocuments } from 'ingester/ninds/csv/cde/ParseReferenceDocuments';
import { parseDesignations, parseNhlbiDesignations } from 'ingester/ninds/csv/cde/ParseDesignations';
import { parseDefinitions, parseNhlbiDefinitions } from 'ingester/ninds/csv/cde/ParseDefinitions';
import { parseClassification, parseNhlbiClassification } from 'ingester/ninds/csv/cde/ParseClassification';
import { classifyItem } from 'server/classification/orgClassificationSvc';
import { parseNhlbiSources, parseSources } from 'ingester/ninds/csv/shared/ParseSources';

export async function createNindsCde(row: any) {
    const designations = parseDesignations(row);
    const definitions = parseDefinitions(row);
    const sources = parseSources();

    const ids = parseIds(row);
    const valueDomain = parseValueDomain(row);
    const referenceDocuments = await parseReferenceDocuments(row);
    const properties = parseProperties(row);
    const nindsCde: any = {
        tinyId: generateTinyId(),
        stewardOrg: {
            name: 'NINDS'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        createdBy: BATCHLOADER,
        created,
        imported,
        sources,
        designations,
        definitions,
        valueDomain,
        referenceDocuments,
        attachments: [],
        properties,
        ids,
        classification: []
    };
    parseClassification(nindsCde, row);
    const DEFAULT_CLASSIFICATION = ['Preclinical + NEI'];
    if (nindsCde.classification.length === 0) {
        classifyItem(nindsCde, 'NINDS', DEFAULT_CLASSIFICATION.concat(['Not Classified']));
    }
    return nindsCde;
}


export async function createNhlbiCde(row: any, formMap) {
    const designations = parseNhlbiDesignations(row, formMap);
    const definitions = parseNhlbiDefinitions(row);
    const sources = parseNhlbiSources();

    const ids = parseNhlbiIds(row);
    const valueDomain = parseNhlbiValueDomain(row);
    const referenceDocuments = await parseReferenceDocuments(row);
    const properties = parseProperties(row);
    const nhlbiCde: any = {
        tinyId: generateTinyId(),
        stewardOrg: {
            name: 'NHLBI'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        createdBy: BATCHLOADER,
        created,
        imported,
        sources,
        designations,
        definitions,
        valueDomain,
        referenceDocuments,
        attachments: [],
        properties,
        ids,
        classification: []
    };
    parseNhlbiClassification(nhlbiCde, row);
    if (nhlbiCde.classification.length === 0) {
        classifyItem(nhlbiCde, 'NHLBI', ['Not Classified']);
    }
    return nhlbiCde;
}
