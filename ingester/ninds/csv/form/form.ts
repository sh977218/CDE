import {isEmpty} from 'lodash';
import {generateTinyId} from 'server/system/mongo-data';
import {BATCHLOADER, created, imported, NINDS_PRECLINICAL_NEI_FILE_PATH} from 'ingester/shared/utility';
import {parseDesignations, parseNhlbiDesignations} from 'ingester/ninds/csv/form/ParseDesignations';
import {parseDefinitions} from 'ingester/ninds/csv/form/ParseDefinitions';
import {parseNhlbiSources, parseSources} from 'ingester/ninds/csv/shared/ParseSources';
import {parseNhlbiReferenceDocuments, parseReferenceDocuments} from 'ingester/ninds/csv/form/ParseReferenceDocuments';
import {parseProperties} from 'ingester/ninds/csv/form/ParseProperties';
import {parseIds, parseNhlbiIds} from 'ingester/ninds/csv/form/ParseIds';
import {parseAttachments, parseNhlbiAttachments} from 'ingester/ninds/csv/form/ParseAttachments';
import {parseClassification} from 'ingester/ninds/csv/form/ParseClassification';
import {parseFormElements, parseNhlbiFormElements} from 'ingester/ninds/csv/form/ParseFormElements';
import {classifyItem} from 'server/classification/orgClassificationSvc';
import {parseNhlbiClassification as parseNhlbiCdeClassification} from 'ingester/ninds/csv/cde/ParseClassification';

export async function createNindsForm(formName: string, csvFileName: string, rows: any[]) {
    const designations = parseDesignations(formName);
    const definitions = parseDefinitions();
    const sources = parseSources();
    const referenceDocuments = await parseReferenceDocuments(rows);
    const properties = parseProperties();
    const ids = parseIds();
    const csvPath = `${NINDS_PRECLINICAL_NEI_FILE_PATH}/${csvFileName}`;
    const attachments = await parseAttachments(formName, csvPath);
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
    const DEFAULT_CLASSIFICATION = ['Preclinical + NEI'];
    parseClassification(nindsForm, rows, DEFAULT_CLASSIFICATION);
    await parseFormElements(nindsForm, rows);

    if (nindsForm.classification.length === 0) {
        classifyItem(nindsForm, 'NINDS', DEFAULT_CLASSIFICATION.concat(['Not Classified']));
    }

    return nindsForm;
}


export async function createNhlbiForm(row, nhlbiCdes) {
    const designations = parseNhlbiDesignations(row);
    const definitions = parseDefinitions();
    const sources = parseNhlbiSources();
    const referenceDocuments = parseNhlbiReferenceDocuments(row);
    const properties = parseProperties();
    const ids = parseNhlbiIds(row);
    const attachments = parseNhlbiAttachments();
    const nhlbiForm: any = {
        tinyId: generateTinyId(),
        stewardOrg: {
            name: 'NHLBI'
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
    if (!isEmpty(nhlbiCdes)) {
        nhlbiForm.formElements = await parseNhlbiFormElements(nhlbiForm, nhlbiCdes, row.CrfId);
        for (const nhlbiCde of nhlbiCdes) {
            parseNhlbiCdeClassification(nhlbiForm, nhlbiCde);
        }
    }

    return nhlbiForm;
}


