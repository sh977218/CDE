import {getCell} from 'shared/loader/utilities/utility';
import {isEmpty} from 'lodash';


export async function parseFormElements(form: any, rows: any[]) {
    const formElements: any[] = [];
    let newSection: any = {
        label: '',
        elementType: 'section',
        formElements: []
    };

    let prevCategoryGroup = '';
    for (const item of rows) {
        const row = item.row;
        const cde = item.cde;

        const formElement = convertCsvRowToFormElement(row, cde);
        newSection.formElements.push(formElement);
    }

    formElements.push(newSection);
    return formElements;
}

function convertCsvRowToFormElement(row: any, cde: any) {
    const label = getCell(row, 'Question Text / Item Text');
    const title = getCell(row, 'naming.designation');
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
        unitsOfMeasure,
        answers: cde.valueDomain.permissibleValues
    };
    if (cde.valueDomain.datatype === 'Text' && !isEmpty(cde.valueDomain.datatypeText)) {
        question.datatypeText = cde.valueDomain.datatypeText;
    }
    if (cde.valueDomain.datatype === 'Number' && !isEmpty(cde.valueDomain.datatypeNumber)) {
        question.datatypeNumber = cde.valueDomain.datatypeNumber;
    }
    if (cde.valueDomain.datatype === 'Date' && !isEmpty(cde.valueDomain.datatypeDate)) {
        question.datatypeDate = cde.valueDomain.datatypeDate;
    }

    if (cde.version) {
        question.cde.version = cde.version;
    }
    return {
        elementType: 'question',
        label,
        // instructions: {value: instructions},
        // multiselect,
        question
    };
}

