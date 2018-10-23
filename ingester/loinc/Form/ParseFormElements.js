const _ = require('lodash');

const DataElement = require('../../../server/cde/mongo-cde').DataElement;
const Form = require('../../../server/form/mongo-form').Form;

const REQUIRED_MAP = require('../Mapping/LOINC_REQUIRED_MAP').map;
const MULTISELECT_MAP = require('../Mapping/LOINC_MULTISELECT_MAP').map;
const CARDINALITY_MAP = require('../Mapping/LOINC_CARDINALITY_MAP').map;

const CreateCDE = require('../CDE/CreateCDE');
const MergeCDE = require('../CDE/MergeCDE');
const CreateForm = require('./CreateForm');
const MergeForm = require('./MergeForm');


exports.parseFormElements = async function (loinc, orgInfo) {
    let formElements = [];
    if (!loinc['PANEL HIERARCHY']) return formElements;
    let elements = loinc['PANEL HIERARCHY']['elements'];
    if (!elements) return formElements;
    console.log('Form ' + loinc['loincId'] + ' has ' + elements.length + ' elements to process.');
    if (!elements || elements.length === 0) return;
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
    let loincId = element.loincId;
    let cdeCond = {
        archived: false,
        "registrationState.registrationStatus": {$ne: "Retired"},
        'ids.id': loincId
    };
    let existingCde = await DataElement.findOne(cdeCond).exec();
    let newCDE = await CreateCDE.createCde(element, orgInfo);
    if (newCDE.valueDomain.datatype === 'Value List') {
        if (_.isEmpty(newCDE.valueDomain.permissibleValues)) {
            console.log(loincId + ' pv is empty');
            process.exit(1);
        }
        for (let pv of newCDE.valueDomain.permissibleValues) {
            if (_.isEmpty(pv.codeSystemName)) {
                console.log(loincId + ' ' + pv.permissibleValue + ' code system is empty');
                process.exit(1);
            }
        }
    }

    if (!existingCde) {
        existingCde = await new DataElement(newCDE).save();
    } else {
        await MergeCDE.mergeCde(newCDE, existingCde, orgInfo);
        existingCde.imported = new Date().toJSON();
        existingCde.updated = new Date().toJSON();
        await existingCde.save();
    }
    existingCde = existingCde.toObject();
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
    let loincId = element.loincId;
    let formCond = {
        archived: false,
        "registrationState.registrationStatus": {$ne: "Retired"},
        'ids.id': loincId
    };
    let existingForm = await Form.findOne(formCond).exec();
    let newForm = await CreateForm.createForm(element.loinc, orgInfo);
    if (!existingForm) {
        existingForm = await new Form(newForm).save();
    } else {
        MergeForm.mergeForm(newForm, existingForm, orgInfo);
    }
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