import { isEmpty, isEqual, trim, uniq } from 'lodash';
import { dataElementModel } from 'server/cde/mongo-cde';
import { BATCHLOADER } from 'ingester/shared/utility';
import { getCell } from 'ingester/ninds/csv/shared/utility';
import { parseFormId } from '../cde/ParseDesignations';
import { runOneNinrDataElement } from 'ingester/ninr/csv/cde/cde';

function convertCsvRowToFormElement(row: any, cde: any) {
    if (cde.toObject) {
        cde = cde.toObject();
    }
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
        instructions: {value},
        multiselect,
        question
    };
}

export async function parseFormElements(form: any, rows: any[]) {
    const formElements: any[] = [];
    let newSection: any = {
        label: '',
        elementType: 'section',
        formElements: []
    };

    let prevCategoryGroup = '';
    for (const row of rows) {
        const cde: any = await runOneNinrDataElement(row);
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
    form.formElements = formElements;
}

function parseQuestionLabel(row, formId) {
    const pqt = getCell(row, 'Suggested Question Text');
    const questionLabels = uniq(pqt.split('-----').map(t => {
        const tArray = t.split(':');
        const formInfo = trim(tArray[0]);
        const formId = parseFormId(formInfo);
        const preferredQuestionText = trim(tArray[1]);
        return {
            questionText: preferredQuestionText,
            formId
        };
    }));
    return questionLabels.filter(q => q.formId === formId);
}

function convertNhlbiCsvRowToFormElement(row, cde, formId) {
    const labels = parseQuestionLabel(row, formId);
    const label = labels[0].questionText;
    const instructionsArray = getCell(row, 'Guidelines/Instructions')
        .replace(/SCKLCELL:/ig, '')
        .split('-----')
        .map(s => trim(s));
    const uniqInstructionsArray = uniq(instructionsArray);
    let instructions = '';
    if (uniqInstructionsArray.length === 1) {
        instructions = uniqInstructionsArray[0];
    } else {
        instructions = uniqInstructionsArray.join(' ----- ');
    }
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
        instructions: {value: instructions},
        multiselect,
        question
    };
}

export async function parseNhlbiFormElements(form, rows, formId) {
    const formElements: any[] = [];
    const newSection: any = {
        label: '',
        elementType: 'section',
        formElements: []
    };
    for (const row of rows) {
        const name = getCell(row, 'Name');
        const cde: any = await dataElementModel.findOne({
            archived: false,
            'ids.id': name,
            'registrationState.registrationStatus': {$ne: 'Retired'}
        });
        if (!cde) {
            const formIds = form.ids.filter(i => i.source === 'NINDS');
            console.log(`formId: ${formIds[0].id} question length: ${rows.length} ${getCell(row, 'External ID.NINDS')} ${name} NHLBI variable not found.`);
            process.exit(1);
        } else {
            const formElement = convertNhlbiCsvRowToFormElement(row, cde, formId);
            newSection.formElements.push(formElement);
        }
    }
    formElements.push(newSection);
    return formElements;
}

