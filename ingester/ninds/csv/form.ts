import { findIndex, isEmpty } from 'lodash';
import { generateTinyId } from 'server/system/mongo-data';
import {
    BATCHLOADER, compareElt, created, imported, lastMigrationScript, mergeElt, updateCde
} from 'ingester/shared/utility';
import { createNindsCde, getCell, parseReferenceDocuments } from 'ingester/ninds/csv/cde';
import { DataElement } from 'server/cde/mongo-cde';

function parseDesignations(formName) {
    return [{designation: formName, tags: []}];
}

function parseDefinitions() {
    return [];
}

async function doOneRow(row) {
    const nindsCde = await createNindsCde(row);
    const newCde = new DataElement(nindsCde);
    const newCdeObj = newCde.toObject();

    const variableName = getCell(row, 'Variable Name');
    let existingCde = await DataElement.findOne({
        archived: false,
        'ids.id': variableName
    });
    if (!existingCde) {
        existingCde = await newCde.save();
        console.log(`created cde tinyId: ${existingCde.tinyId}`);
    } else {
        const diff = compareElt(newCde.toObject(), existingCde.toObject(), 'NINDS');
        if (isEmpty(diff)) {
            existingCde.imported = imported;
            existingCde.lastMigrationScript = lastMigrationScript;
            existingCde = await existingCde.save();
            console.log(`same cde tinyId: ${existingCde.tinyId}`);
        } else {
            const existingCdeObj = existingCde.toObject();
            mergeElt(existingCdeObj, newCdeObj, 'NCI');
            existingCdeObj.imported = imported;
            existingCdeObj.changeNote = lastMigrationScript;
            existingCdeObj.lastMigrationScript = lastMigrationScript;
            await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true});
            console.log(`updated cde tinyId: ${existingCde.tinyId}`);
        }
    }
    return existingCde.toObject();
}

function convertCsvRowToQuestion(row, cde) {
    const question = {};
    
    return question;
}

async function parseFormElements(rows) {
    const formElements = [];
    for (const row of rows) {
        const cde = await doOneRow(row);
        convertCsvRowToQuestion(row, cde);
    }

    return formElements;
}

async function parseFormReferenceDocuments(rows) {
    const referenceDocuments = [];
    for (const row of rows) {
        const newReferenceDocuments = await parseReferenceDocuments(row);
        for (const newReferenceDocument of newReferenceDocuments) {
            const i = findIndex(referenceDocuments, newReferenceDocument);
            if (i === -1) {
                referenceDocuments.push(newReferenceDocument);
            }
        }
    }
    return referenceDocuments;
}

function parseProperties() {
    return [];
}

function parseIds() {
    return [];
}

function parseClassification(rows) {
    const classification = [{
        stewardOrg: {name: 'NINDS'},
        elements: [{
            name: 'Preclinical TBI',
            elements: []
        }]
    }];
    return classification;
}

export async function createNindsForm(formName, rows) {
    const designations = parseDesignations(formName);
    const definitions = parseDefinitions();
    const referenceDocuments = await parseFormReferenceDocuments(rows);
    const formElements = await parseFormElements(rows);
    const properties = parseProperties();
    const ids = parseIds();
    const classification = parseClassification(rows);
    const nindsForm = {
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
        formElements,
        referenceDocuments,
        properties,
        ids,
        classification
    };
    return nindsForm;
}
