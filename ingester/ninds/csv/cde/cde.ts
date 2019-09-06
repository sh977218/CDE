import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported } from 'ingester/shared/utility';

import { parseProperties } from 'ingester/ninds/csv/cde/ParseProperties';
import { parseIds } from 'ingester/ninds/csv/cde/ParseIds';
import { parseValueDomain } from 'ingester/ninds/csv/cde/ParseValueDomain';
import { parseReferenceDocuments } from 'ingester/ninds/csv/cde/ParseReferenceDocuments';
import { parseDesignations } from 'ingester/ninds/csv/cde/ParseDesignations';
import { parseDefinitions } from 'ingester/ninds/csv/cde/ParseDefinitions';
import { parseClassification } from 'ingester/ninds/csv/cde/ParseClassification';

export async function createNindsCde(row) {
    const ids = parseIds(row);
    const designations = parseDesignations(row);
    const definitions = parseDefinitions(row);
    const valueDomain = parseValueDomain(row);
    const referenceDocuments = await parseReferenceDocuments(row);
    const properties = parseProperties(row);
    const classification = parseClassification(row);
    const nindsCde = {
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
        designations,
        definitions,
        valueDomain,
        referenceDocuments,
        properties,
        ids,
        classification
    };
    return nindsCde;
}
