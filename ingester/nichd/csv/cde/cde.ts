import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported, lastMigrationScript } from 'ingester/shared/utility';
import { parseNichdDesignations } from 'ingester/nichd/csv/cde/ParseDesignations';
import { parseNichdDefinitions } from 'ingester/nichd/csv/cde/ParseDefinitions';
import { parseNichdSources } from 'ingester/nichd/csv/cde/ParseSources';
import { parseNichdIds } from 'ingester/nichd/csv/cde/ParseIds';
import { parseNichdValueDomain } from 'ingester/nichd/csv/cde/ParseValueDomain';
import { parseNichdReferenceDocuments } from 'ingester/nichd/csv/cde/ParseReferenceDocuments';
import { parseNichdProperties } from 'ingester/nichd/csv/cde/ParseProperties';
import { parseNichdClassification } from 'ingester/nichd/csv/cde/ParseClassification';

export function createNichdCde(nichdRow, source) {
    const nlmId = nichdRow.shortID;
    const designations = parseNichdDesignations(nichdRow);
    const definitions = parseNichdDefinitions();
    const sources = parseNichdSources(source);

    const ids = parseNichdIds(nichdRow);
    const valueDomain = parseNichdValueDomain(nichdRow);
    const referenceDocuments = parseNichdReferenceDocuments();
    const properties = parseNichdProperties();
    const classification = parseNichdClassification();
    const nichdCde: any = {
        tinyId: nlmId ? nlmId : generateTinyId(),
        stewardOrg: {
            name: 'NICHD'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        createdBy: BATCHLOADER,
        lastMigrationScript,
        changeNote: lastMigrationScript,
        created,
        imported,
        sources,
        source: 'NICHD NBSTRN Krabbe Disease',
        designations,
        definitions,
        valueDomain,
        referenceDocuments,
        attachments: [],
        properties,
        ids,
        classification
    };

    return nichdCde;
}