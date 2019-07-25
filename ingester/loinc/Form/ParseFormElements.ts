import { map as CARDINALITY_MAP } from '../Mapping/LOINC_CARDINALITY_MAP';
import { map as MULTISELECT_MAP } from '../Mapping/LOINC_MULTISELECT_MAP';
import { map as REQUIRED_MAP } from '../Mapping/LOINC_REQUIRED_MAP';
import { runOneCde } from '../loader/loincCdeLoader';
import { runOneForm } from '../loader/loincFormLoader';

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
    console.log('createdRedCde: ' + createdRedCde);
    console.log('createdRedCdes: ' + createdRedCdes);
    console.log('sameRedCde: ' + sameRedCde);
    console.log('sameRedCdes: ' + sameRedCdes);
    console.log('changedRedCde: ' + changedRedCde);
    console.log('changedRedCdes: ' + changedRedCdes);

    console.log('createdRedForm: ' + createdRedForm);
    console.log('createdRedForms: ' + createdRedForms);
    console.log('sameRedForm: ' + sameRedForm);
    console.log('sameRedForms: ' + sameRedForms);
    console.log('changedRedForm: ' + changedRedForm);
    console.log('changedRedForms: ' + changedRedForms);
    return formElements;
}

let createdRedCde = 0;
let createdRedCdes = [];
let sameRedCde = 0;
let sameRedCdes = [];
let changedRedCde = 0;
let changedRedCdes = [];

async function loadCde(element, orgInfo) {
    let existingCde = await runOneCde(element, orgInfo);
    let question = {
        instructions: {value: ''},
        cde: {
            tinyId: existingCde.tinyId,
            name: existingCde.designations[0].designation,
            designations: existingCde.designations,
            definitions: existingCde.definitions,
            version: existingCde.version,
            permissibleValues: existingCde.valueDomain.permissibleValues,
            ids: existingCde.ids
        },
        required: REQUIRED_MAP[element['cardinality']],
        multiselect: MULTISELECT_MAP[element['ANSWER CARDINALITY']],
        datatype: existingCde.valueDomain.datatype,
        datatypeNumber: existingCde.valueDomain.datatypeNumber,
        datatypeText: existingCde.valueDomain.datatypeText,
        answers: existingCde.valueDomain.permissibleValues,
        unitsOfMeasure: []
    };
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

let createdRedForm = 0;
let createdRedForms = [];
let sameRedForm = 0;
let sameRedForms = [];
let changedRedForm = 0;
let changedRedForms = [];

async function loadForm(element, orgInfo) {
    let existingForm = await runOneForm(element, orgInfo);
    if (!existingForm.designations[0])
        debugger;
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