import { generateTinyId } from 'server/system/mongo-data';
import { BATCHLOADER, created, imported } from 'ingester/shared/utility';
import { parseDesignations } from 'ingester/ninds/csv/form/ParseDesignations';
import { parseDefinitions } from 'ingester/ninds/csv/form/ParseDefinitions';
import { parseSources } from 'ingester/ninds/csv/shared/ParseSources';
import { parseReferenceDocuments } from 'ingester/ninds/csv/form/ParseReferenceDocuments';
import { parseProperties } from 'ingester/ninds/csv/form/ParseProperties';
import { parseIds } from 'ingester/ninds/csv/form/ParseIds';
import { parseAttachments } from 'ingester/ninds/csv/form/ParseAttachments';
import { parseClassification } from 'ingester/ninds/csv/form/ParseClassification';
import { parseFormElements } from 'ingester/ninds/csv/form/ParseFormElements';

export async function createNindsForm(formName: string, csvFileName: string, rows: any[]) {
    const designations = parseDesignations(formName);
    const definitions = parseDefinitions();
    const sources = parseSources();
    const referenceDocuments = await parseReferenceDocuments(rows);
    const properties = parseProperties();
    const ids = parseIds();
    const attachments = await parseAttachments(formName, csvFileName);
    const nindsForm: any = {
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
        sources,
        formElements: [],
        referenceDocuments,
        properties,
        ids,
        attachments,
        classification: [],
        comments: []
    };
    nindsForm.formElements = await parseFormElements(nindsForm, rows);
    parseClassification(nindsForm, rows);
    return nindsForm;
}
