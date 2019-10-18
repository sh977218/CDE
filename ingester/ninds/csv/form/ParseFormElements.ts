import { isEmpty, isEqual, forEach, trim } from 'lodash';
import { dataElementModel } from 'server/cde/mongo-cde';
import {
    BATCHLOADER, compareElt, imported, lastMigrationScript, mergeElt, updateCde, updateRowArtifact
} from 'ingester/shared/utility';
import {
    changeNindsPreclinicalNeiClassification, fixDefinitions, fixReferenceDocuments, getCell,
} from 'ingester/ninds/csv/shared/utility';
import { createNindsCde } from 'ingester/ninds/csv/cde/cde';

async function fixCde(existingCde: any) {
    fixDefinitions(existingCde);
    fixReferenceDocuments(existingCde);

    const savedCde = await existingCde.save().catch((err: any) => {
        console.log(`Not able to save form when fixCde ${existingCde.tinyId} ${err}`);
        process.exit(1);
    });
    return savedCde;
}

async function doOneRow(row: any) {
    const nindsCde = await createNindsCde(row);
    const newCde = new dataElementModel(nindsCde);
    const newCdeObj = newCde.toObject();

    const variableName = getCell(row, 'Variable Name');
    let existingCde: any = await dataElementModel.findOne({archived: false, 'ids.id': variableName});
    if (!existingCde) {
        existingCde = await newCde.save().catch((err: any) => {
            console.log(`Not able to save form when save new NINDS cde ${newCde.tinyId} ${err}`);
            process.exit(1);
        });
        console.log(`created cde tinyId: ${existingCde.tinyId}`);
    } else {
        // @TODO remove after load
        existingCde = await fixCde(existingCde);

        const diff = compareElt(newCde.toObject(), existingCde.toObject(), 'NINDS');
        changeNindsPreclinicalNeiClassification(existingCde, newCde.toObject(), 'NINDS');

        if (isEmpty(diff)) {
            existingCde.lastMigrationScript = lastMigrationScript;
            existingCde.imported = imported;
            existingCde = await existingCde.save().catch((err: any) => {
                console.log(`Not able to save form when save existing NINDS cde ${existingCde.tinyId} ${err}`);
                process.exit(1);
            });
            console.log(`same cde tinyId: ${existingCde.tinyId}`);
        } else {
            const existingCdeObj = existingCde.toObject();
            mergeElt(existingCdeObj, newCdeObj, 'NINDS', 'NINDS');
            await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true});
            console.log(`updated cde tinyId: ${existingCde.tinyId}`);
        }
    }
    await updateRowArtifact(existingCde, newCdeObj, 'NINDS Preclinical NEI', 'NINDS');

    const savedCde: any = await dataElementModel.findOne({archived: false, 'ids.id': variableName});
    return savedCde;
}

function convertCsvRowToFormElement(row: any, cde: any) {
    const label = getCell(row, 'Preferred Question Text');
    const value = getCell(row, 'Guidelines/Instructions');
    const inputRestriction = getCell(row, 'Input Restriction');
    const multiselect = inputRestriction.indexOf('Multiple Pre-Defined Values Selected') !== -1;
    const title = getCell(row, 'Title');
    const unitsOfMeasure = [];
    if (cde.valueDomain.uom) {
        unitsOfMeasure.push({code: cde.valueDomain.uom});
    }
    const question: any = {
        cde: {
            tinyId: cde.tinyId,
            name: title,
            permissibleValues: cde.valueDomain.permissibleValues,
            ids: cde.ids,
            derivationRules: cde.derivationRules
        },
        datatype: cde.valueDomain.datatype,
        datatypeNumber: cde.valueDomain.datatypeNumber,
        datatypeText: cde.valueDomain.datatypeText,
        datatypeDate: cde.valueDomain.datatypeDate,
        unitsOfMeasure,
        answers: cde.valueDomain.permissibleValues
    };
    if (cde.version) {
        question.cde.version = cde.version;
    }
    return {
        elementType: 'question',
        label,
        instructions: {value},
        multiselect,
        question
    };
}

export async function parseFormElements(form: any, rows: any[]): Promise<any[]> {
    const formElements: any[] = [];
    let newSection: any = {
        label: '',
        elementType: 'section',
        formElements: []
    };

    let prevCategoryGroup = '';
    for (const row of rows) {
        const cde = await doOneRow(row);
        const formElement = convertCsvRowToFormElement(row, cde);
        let categoryGroup = getCell(row, 'Category/Group');
        if (isEmpty(categoryGroup)) {
            console.log(`empty category`);
            categoryGroup = 'Unnamed category';
            const title = getCell(row, 'Title');
            const emptyCategoryComment = {
                text: `${title} has empty category.`,
                user: BATCHLOADER,
                created: new Date(),
                pendingApproval: false,
                linkedTab: 'description',
                status: 'active',
                replies: [],
                element: {
                    eltType: 'form',
                }
            };
            form.comments.push(emptyCategoryComment);
        }
        if (isEqual(prevCategoryGroup, categoryGroup)) {
            newSection.label = categoryGroup;
            newSection.formElements.push(formElement);
        } else {
            formElements.push(newSection);
            newSection = {
                label: '',
                elementType: 'section',
                formElements: [formElement]
            };
        }
        prevCategoryGroup = categoryGroup;
    }
    formElements.push(newSection);
    return formElements;
}
