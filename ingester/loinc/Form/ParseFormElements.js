const DataElement = require('../../../server/cde/mongo-cde').DataElement;
const REQUIRED_MAP = require('../Mapping/LOINC_REQUIRED_MAP').map;
const MULTISELECT_MAP = require('../Mapping/LOINC_MULTISELECT_MAP').map;
const CARDINALITY_MAP = require('../Mapping/LOINC_CARDINALITY_MAP').map;

const CreateForm = require('./CreateForm');

exports.parseFormElements = function (loinc) {
    return new Promise(async (resolve, reject) => {
        let formElements = [];
        let elements = loinc['PANEL HIERARCHY']['PANEL HIERARCHY']['elements'];
        console.log('Form ' + loinc['loincId'] + ' has ' + elements.length + ' elements to process.');
        if (!elements || elements.length === 0) resolve();
        formElements.push({
            elementType: 'section',
            label: '',
            instructions: {
                value: ""
            },
            formElements: []
        });
        for (let element of elements) {
            let isElementForm = element.elements.length > 0;
            let f = loadCde;
            if (isElementForm) f = loadForm;
            let formElement = await f(element).catch(e => {
                throw e;
            });
            formElements.push(formElement);
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
            .where("ids")
            .elemMatch(function (elem) {
                elem.where("source").equals('LOINC');
                elem.where("id").equals(loincId);
            }).exec().catch(e => {
                throw e;
            });
        if (!existingCde) reject(loincId + ' not found.');
        let question = {
            instructions: {value: ''},
            cde: {
                tinyId: existingCde.tinyId,
                name: existingCde.naming[0].designation,
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
        let existingForm = await DataElement.findOne(formCond)
            .where("ids").elemMatch(function (elem) {
                elem.where("source").equals('LOINC');
                elem.where("id").equals(loincId);
            }).exec().catch(e => {
                throw e;
            });
        if (!existingForm) reject(loincId + ' not found.');
        let inForm = {
            form: {
                tinyId: existingForm.tinyId,
                version: existingForm.version,
                name: existingForm.naming[0].designation
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