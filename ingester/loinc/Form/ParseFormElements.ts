import { map as CARDINALITY_MAP } from 'ingester/loinc/Mapping/LOINC_CARDINALITY_MAP';
import { map as MULTISELECT_MAP } from 'ingester/loinc/Mapping/LOINC_MULTISELECT_MAP';
import { map as REQUIRED_MAP } from 'ingester/loinc/Mapping/LOINC_REQUIRED_MAP';
import { runOneCde } from 'ingester/loinc/LOADER/loincCdeLoader';
import { runOneForm } from 'ingester/loinc/LOADER/loincFormLoader';
import { fixValueDomainOrQuestion } from 'ingester/shared/utility';

export async function parseFormElements(loinc, orgInfo) {
    if (loinc.loinc) loinc = loinc.loinc;
    let formElements = [];
    if (!loinc['PANEL HIERARCHY']) return formElements;
    let elements = loinc['PANEL HIERARCHY']['elements'];
    if (!elements) return formElements;
    if (!elements || elements.length === 0) return;
    console.log('Form ' + loinc['loincId'] + ' has ' + elements.length + ' elements to process.');
    let tempFormElements = formElements;
    let needOuterSection = elements.filter(element => element.elements.length > 0).length === 0;
    if (needOuterSection) {
        formElements.push({
            elementType: 'section',
            label: '',
            instructions: {
                value: ""
            },
            formElements: []
        });
        tempFormElements = formElements[0].formElements;
    }

    for (let element of elements) {
        let isElementForm = element.elements.length > 0;
        if (isElementForm) {
            let formElement = await loadForm(element, orgInfo);
            tempFormElements.push(formElement);
        } else {
            let formElement = await loadCde(element, orgInfo);
            tempFormElements.push(formElement);
        }
    }
    return formElements;
}

function elementToQuestion(existingCde, element) {
    let question = {
        instructions: {value: ''},
        cde: {
            tinyId: existingCde.tinyId,
            name: existingCde.designations[0].designation,
            version: existingCde.version,
            permissibleValues: existingCde.valueDomain.permissibleValues,
            ids: existingCde.ids
        },
        required: REQUIRED_MAP[element['cardinality']],
        multiselect: MULTISELECT_MAP[element['ANSWER CARDINALITY']],
        datatype: existingCde.valueDomain.datatype,
        answers: existingCde.valueDomain.permissibleValues,
        unitsOfMeasure: [],

        datatypeText: existingCde.valueDomain.datatypeText,
        datatypeNumber: existingCde.valueDomain.datatypeNumber,
        datatypeDate: existingCde.valueDomain.datatypeDate,
        datatypeTime: existingCde.valueDomain.datatypeTime,
        datatypeDynamicCodeList: existingCde.valueDomain.datatypeDynamicCodeList,
        datatypeValueList: existingCde.valueDomain.datatypeValueList,
        datatypeExternallyDefined: existingCde.valueDomain.datatypeExternallyDefined,
    };
    fixValueDomainOrQuestion(question);
    if (question.datatype === 'Text') {
        question.multiselect = false;
    }
    if (element['exUcumUnitsText']) {
        question.unitsOfMeasure.push({system: '', code: element['exUcumUnitsText']});
    }
    return {
        elementType: 'question',
        instructions: {},
        cardinality: CARDINALITY_MAP[element.cardinality],
        label: element.loincName.trim(),
        question: question,
        formElements: []
    };
}

async function loadCde(element, orgInfo) {
    let existingCde = await runOneCde(element, orgInfo);
    let question = elementToQuestion(existingCde, element);
    return question;
}

function elementToInForm(existingForm, element) {
    let inForm = {
        form: {
            tinyId: existingForm.tinyId,
            version: existingForm.version,
            name: existingForm.designations[0].designation
        }
    };
    return {
        elementType: 'form',
        instructions: {value: '', valueFormat: ''},
        cardinality: CARDINALITY_MAP[element.cardinality],
        label: element.loincName.trim(),
        inForm: inForm,
        formElements: []
    };
}

async function loadForm(element, orgInfo) {
    let existingForm = await runOneForm(element, orgInfo);
    let inForm = elementToInForm(existingForm, element);
    return inForm;
}