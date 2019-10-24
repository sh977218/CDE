import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported } from 'ingester/shared/utility';

import { parseProperties } from 'ingester/ninds/csv/cde/ParseProperties';
import { parseIds } from 'ingester/ninds/csv/cde/ParseIds';
import { parseValueDomain } from 'ingester/ninds/csv/cde/ParseValueDomain';
import { parseReferenceDocuments } from 'ingester/ninds/csv/cde/ParseReferenceDocuments';
import { parseDesignations } from 'ingester/ninds/csv/cde/ParseDesignations';
import { parseDefinitions } from 'ingester/ninds/csv/cde/ParseDefinitions';
import { parseClassification } from 'ingester/ninds/csv/cde/ParseClassification';
import { classifyItem } from 'server/classification/orgClassificationSvc';
import { parseSources } from 'ingester/ninds/csv/shared/ParseSources';

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
        classifyItem(nindsCde, 'NINDS', DEFAULT_CLASSIFICATION);
    }
    return nindsCde;
}
