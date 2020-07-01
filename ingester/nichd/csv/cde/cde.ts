import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported } from 'ingester/shared/utility';
import { parseNichdDesignations } from 'ingester/nichd/csv/cde/ParseDesignations';
import { parseNichdDefinitions } from 'ingester/nichd/csv/cde/ParseDefinitions';
import { parseNichdSources } from 'ingester/nichd/csv/cde/ParseSources';
import { parseNichdIds } from 'ingester/nichd/csv/cde/ParseIds';
import { parseNichdValueDomain } from 'ingester/nichd/csv/cde/ParseValueDomain';
import { parseNichdReferenceDocuments } from 'ingester/nichd/csv/cde/ParseReferenceDocuments';
import { parseNichdProperties } from 'ingester/nichd/csv/cde/ParseProperties';

export function createNichdCde(nichdRow) {
    const designations = parseNichdDesignations(nichdRow);
    const definitions = parseNichdDefinitions();
    const sources = parseNichdSources();

    const ids = parseNichdIds(nichdRow);
    const valueDomain = parseNichdValueDomain(nichdRow);
    const referenceDocuments = parseNichdReferenceDocuments();
    const properties = parseNichdProperties();
    const nichdCde: any = {
        tinyId: generateTinyId(),
        stewardOrg: {
            name: 'NICHD'
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
        classification: [{
            stewardOrg: {
                name: 'NICHD',
                elements: [{
                    name: 'NBSTRN Krabbe Disease',
                    elements: []
                }]
            }
        }]
    };

    return nichdCde;
}
