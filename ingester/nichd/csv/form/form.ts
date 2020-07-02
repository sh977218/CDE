import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported } from 'ingester/shared/utility';
import { parseFormElements } from 'ingester/nichd/csv/form/ParseFormElements';
import { parseNichdClassification } from 'ingester/nichd/csv/cde/ParseClassification';

export async function createNichdForm(nichdFormName, nichdRows) {
    const designations = [{
        designation: nichdFormName,
        tags: []
    }];
    const classification = parseNichdClassification();

    const nichdForm: any = {
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
        designations,
        definitions: [],
        sources: [],
        formElements: [],
        referenceDocuments: [],
        properties: [],
        ids: [],
        attachments: [],
        classification,
        comments: []
    };

    await parseFormElements(nichdForm, nichdRows);
    return nichdForm;
}
