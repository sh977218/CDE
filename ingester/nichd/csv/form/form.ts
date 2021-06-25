import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported, lastMigrationScript } from 'ingester/shared/utility';
import { NichdConfig } from 'ingester/nichd/shared/utility';
import { parseFormElements } from 'ingester/nichd/csv/form/ParseFormElements';
import { parseSources } from 'ingester/nichd/csv/cde/ParseSources';
import { classifyItem } from 'server/classification/orgClassificationSvc';
import { parseStewardOrg } from 'ingester/nichd/csv/cde/ParseStewardOrg';

export async function createNichdForm(nichdFormName: string, nichdRows: any[], config: NichdConfig) {
    const designations = [{
        designation: nichdFormName,
        tags: []
    }];
    const sources = parseSources(config);
    const stewardOrg = parseStewardOrg(config);

    const nichdForm: any = {
        tinyId: generateTinyId(),
        source: config.source,
        sources,
        stewardOrg,
        registrationState: {registrationStatus: config.registrationStatus},
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
        classification: [],
        comments: []
    };

//    classifyItem(nichdForm, config.classificationOrgName, config.classificationArray.concat([nichdFormName]));
    classifyItem(nichdForm, config.classificationOrgName, config.classificationArray);
    await parseFormElements(nichdForm, nichdRows, config);
    return nichdForm;
}
