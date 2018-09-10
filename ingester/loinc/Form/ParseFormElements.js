const DataElement = require('../../../server/cde/mongo-cde').DataElement;
const Form = require('../../../server/form/mongo-form').Form;
const REQUIRED_MAP = require('../Mapping/LOINC_REQUIRED_MAP').map;
const MULTISELECT_MAP = require('../Mapping/LOINC_MULTISELECT_MAP').map;
const CARDINALITY_MAP = require('../Mapping/LOINC_CARDINALITY_MAP').map;

exports.parseFormElements = function (loinc) {
    return new Promise(async (resolve, reject) => {
        let formElements = [];
        let elements = loinc['PANEL HIERARCHY']['PANEL HIERARCHY']['elements'];
        console.log('Form ' + loinc['loincId'] + ' has ' + elements.length + ' elements to process.');
        if (!elements || elements.length === 0) resolve();
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
            let formElement = await f(element).catch(e => {
                reject(e);
            });
            tempFormElements.push(formElement);
        }
        resolve(formElements);
    })

};

loadCde = function (element) {
    return new Promise(async (resolve, reject) => {
        let cdeCond = {
            archived: false,
            "registrationState.registrationStatus": {$ne: "Retired"}
        };
        let loincId = element['LOINC#'];
        let existingCde = await DataElement.findOne(cdeCond)
            .elemMatch('ids', {source: 'LOINC', id: loincId}).exec().catch(e => {
                throw e;
            });
        if (!existingCde) reject('cde ' + loincId + ' not found.');
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
            required: REQUIRED_MAP[element['ANSWER CARDINALITY']],
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
        if (element['Ex UCUM Units']) {
            question.unitsOfMeasure.push({system: '', code: element['Ex UCUM Units']});
        }
        let formElement = {
            elementType: 'question',
            instructions: {},
            cardinality: CARDINALITY_MAP[element['Cardinality']],
            label: element['LOINC Name'],
            question: question,
            formElements: []
        };
        resolve(formElement);
    })
};

loadForm = function (element) {
    return new Promise(async (resolve, reject) => {
        let formCond = {
            archived: false,
            "registrationState.registrationStatus": {$ne: "Retired"}
        };

        let loincId = element['LOINC#'];
        let existingForm = await Form.findOne(formCond)
            .elemMatch('ids', {source: 'LOINC', id: loincId}).exec().catch(e => {
                throw e;
            });
        if (!existingForm) reject('form ' + loincId + ' not found.');
        existingForm = existingForm.toObject();
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
            cardinality: CARDINALITY_MAP[element['Cardinality']],
            label: element['LOINC Name'].replace('[AHRQ]', '').trim(),
            inForm: inForm,
            formElements: []
        };
        resolve(formElement);
    });
};