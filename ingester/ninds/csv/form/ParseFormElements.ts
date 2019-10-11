import { isEmpty, isEqual } from 'lodash';
import { dataElementModel } from 'server/cde/mongo-cde';
import { BATCHLOADER, compareElt, imported, lastMigrationScript, mergeElt, updateCde } from 'ingester/shared/utility';
import { getCell } from 'ingester/ninds/csv/shared/utility';
import { createNindsCde } from 'ingester/ninds/csv/cde/cde';

async function doOneRow(row: any) {
    const nindsCde = await createNindsCde(row);
    const newCde = new dataElementModel(nindsCde);
    const newCdeObj = newCde.toObject();

    const variableName = getCell(row, 'Variable Name');
    let existingCde: any = await dataElementModel.findOne({
        archived: false,
        'ids.id': variableName
    });
    if (!existingCde) {
        existingCde = await newCde.save().catch((e: any) => {
            console.log('await newCde.save().catch: ' + e);
            process.exit(1);
        });
        console.log(`created cde tinyId: ${existingCde.tinyId}`);
    } else {
        const diff = compareElt(newCde.toObject(), existingCde.toObject(), 'NINDS');
        if (isEmpty(diff)) {
            existingCde.imported = imported;
            existingCde.lastMigrationScript = lastMigrationScript;
            existingCde = await existingCde.save().catch((e: any) => {
                console.log('await existingCde.save().catch: ' + e);
                process.exit(1);
            });
            console.log(`same cde tinyId: ${existingCde.tinyId}`);
        } else {
            const existingCdeObj = existingCde.toObject();
            mergeElt(existingCdeObj, newCdeObj, 'NINDS', 'NINDS');
            existingCdeObj.imported = imported;
            existingCdeObj.changeNote = lastMigrationScript;
            existingCdeObj.lastMigrationScript = lastMigrationScript;
            await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true});
            console.log(`updated cde tinyId: ${existingCde.tinyId}`);
        }
    }
    return existingCde.toObject();
}

function convertCsvRowToFormElement(row: any, cde: any) {
    const label = getCell(row, 'Preferred Question Text');
    const value = getCell(row, 'Guidelines/Instructions');
    const inputRestriction = getCell(row, 'Input Restriction');
    const multiselect = inputRestriction.indexOf('Multiple Pre-Defined Values Selected') !== -1;
    const title = getCell(row, 'Title');

    return {
        elementType: 'question',
        label,
        instructions: {value},
        multiselect,
        question: {
            cde: {
                tinyId: cde.tinyId,
                name: title,
                version: cde.version,
                permissibleValues: cde.valueDomain.permissibleValues,
                ids: cde.ids,
                derivationRules: cde.derivationRules
            },
            datatype: cde.valueDomain.datatype,
            datatypeNumber: cde.valueDomain.datatypeNumber,
            datatypeText: cde.valueDomain.datatypeText,
            datatypeDate: cde.valueDomain.datatypeDate,
            unitsOfMeasure: {system: '', code: cde.valueDomain.uom},
            answers: cde.valueDomain.permissibleValues
        }
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
