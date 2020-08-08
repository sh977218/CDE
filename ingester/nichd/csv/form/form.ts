import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported, lastMigrationScript } from 'ingester/shared/utility';
import { parseFormElements } from 'ingester/nichd/csv/form/ParseFormElements';
import { parseNichdClassification } from 'ingester/nichd/csv/cde/ParseClassification';
import { parseNichdSources } from 'ingester/nichd/csv/cde/ParseSources';

export async function createNichdForm(nichdFormName, nichdRows, source) {
    const designations = [{
        designation: nichdFormName,
        tags: []
    }];
    const sources = parseNichdSources(source);
    const classification = parseNichdClassification();

    const nichdForm: any = {
        tinyId: generateTinyId(),
        source: 'NICHD NBSTRN Krabbe Disease',
        sources,
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
        designations,
        definitions: [],
        formElements: [],
        referenceDocuments: [],
        properties: [],
        ids: [],
        attachments: [],
        classification,
        comments: []
    };

    await parseFormElements(nichdForm, nichdRows, source);
    return nichdForm;
}
