import { isEmpty, isEqual } from 'lodash';
import { dataElementModel } from 'server/cde/mongo-cde';
import { BATCHLOADER } from 'ingester/shared/utility';
import { getCell } from 'ingester/ninds/csv/shared/utility';

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
        const variableName = getCell(row, 'Variable Name');
        const cde: any = await dataElementModel.findOne({archived: false, 'ids.id': variableName});
        if (!cde) {
            console.log(`${variableName} not found.`);
            process.exit(1);
        }
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
