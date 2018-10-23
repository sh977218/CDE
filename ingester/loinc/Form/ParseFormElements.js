const _ = require('lodash');

const REQUIRED_MAP = require('../Mapping/LOINC_REQUIRED_MAP').map;
const MULTISELECT_MAP = require('../Mapping/LOINC_MULTISELECT_MAP').map;
const CARDINALITY_MAP = require('../Mapping/LOINC_CARDINALITY_MAP').map;

exports.parseFormElements = async (loinc, orgInfo) => {
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
        let f = loadCde;
        if (isElementForm) f = loadForm;
        let formElement = await f(element, orgInfo);
        tempFormElements.push(formElement);
    }
    return formElements;
};

loadCde = async function (element, orgInfo) {
    const loincLoader = require('../Website/loincLoader');
    let existingCde = await loincLoader.runOneCde(element, orgInfo);
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
    let formElement = {
        elementType: 'question',
        instructions: {},
        cardinality: CARDINALITY_MAP[element.cardinality],
        label: element.loincName.trim(),
        question: question,
        formElements: []
    };
    return formElement;
};

loadForm = async function (element, orgInfo) {
    const loincLoader = require('../Website/loincLoader');
    let existingForm = await loincLoader.runOneForm(element, orgInfo);
    if (!existingForm.designations[0])
        debugger;
    let inForm = {
        form: {
            tinyId: existingForm.tinyId,
            version: existingForm.version,
            name: existingForm.designations[0].designation
        }
    };
    let formElement = {
        elementType: 'form',
        instructions: {value: '', valueFormat: ''},
        cardinality: CARDINALITY_MAP[element.cardinality],
        label: element.loincName.trim(),
        inForm: inForm,
        formElements: []
    };
    return formElement;
};