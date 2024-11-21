import {generateTinyId} from 'server/system/mongo-data';
import {BATCHLOADER, created, imported, lastMigrationScript} from 'ingester/shared/utility';
import {classifyItem} from 'server/classification/orgClassificationSvc';

import {parseNhlbiDesignations} from 'ingester/nhlbi/cde/ParseDesignations';
import {parseNhlbiDefinitions} from 'ingester/nhlbi/cde/ParseDefinitions';
import {parseNhlbiSources} from 'ingester/nhlbi/cde/ParseSources';
import {parseNhlbiIds} from 'ingester/nhlbi/cde/ParseIds';
import {parseNhlbiValueDomain} from 'ingester/nhlbi/cde/ParseValueDomain';
import {parseNhlbiClassification} from 'ingester/nhlbi/cde/ParseClassification';

export async function createNhlbiCde(row: any) {

    const designations = parseNhlbiDesignations(row);
    const definitions = parseNhlbiDefinitions(row);
    const sources = parseNhlbiSources();
    const ids = parseNhlbiIds(row);
    const valueDomain = parseNhlbiValueDomain(row);
    const nhlbiCde: any = {
        tinyId: generateTinyId(),
        stewardOrg: {
            name: 'NHLBI'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        createdBy: BATCHLOADER,
        changeNote: lastMigrationScript,
        created,
        imported,
        sources,
        designations,
        definitions,
        valueDomain,
        attachments: [],
        ids,
        classification: []
    };
    parseNhlbiClassification(nhlbiCde, row);
    if (nhlbiCde.classification.length === 0) {
        classifyItem(nhlbiCde, 'NHLBI', ['Not Classified']);
    }
    return nhlbiCde;
}