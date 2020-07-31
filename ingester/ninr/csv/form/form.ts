import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported, lastMigrationScript } from 'ingester/shared/utility';
import { parseNinrFormElements } from 'ingester/ninr/csv/form/ParseFormElements';
import { parseNinrClassification } from 'ingester/ninr/csv/form/ParseClassification';
import { parseNinrSources } from 'ingester/ninr/csv/cde/ParseSources';
import { parseNinrDesignations } from 'ingester/ninr/csv/form/ParseDesignations';
import { parseNinrReferenceDocuments } from 'ingester/ninr/csv/form/ParseReferenceDocuments';
import { parseNinrProperties } from 'ingester/ninr/csv/form/ParseProperties';
import { parseNinrAttachments } from 'ingester/ninr/csv/form/ParseAttachments';
import { parseNinrDefinitions } from 'ingester/ninr/csv/form/ParseDefinitions';
import { parseNinrIds } from 'ingester/ninr/csv/form/ParseIds';

export async function createNinrForm(ninrFormName, ninrRows, source) {
    const designations = parseNinrDesignations(ninrFormName);
    const definitions = parseNinrDefinitions();
    const sources = parseNinrSources(source);

    const referenceDocuments = await parseNinrReferenceDocuments(ninrRows);
    const properties = parseNinrProperties();
    const ids = parseNinrIds();
    const attachments = await parseNinrAttachments(ninrFormName);
    const classification = parseNinrClassification();

    const ninrForm: any = {
        tinyId: generateTinyId(),
        source: 'NINR',
        sources,
        stewardOrg: {
            name: 'NINR'
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
        definitions,
        formElements: [],
        referenceDocuments,
        properties,
        ids,
        attachments,
        classification,
        comments: []
    };
    await parseNinrFormElements(ninrForm, ninrRows);
    return ninrForm;
}
