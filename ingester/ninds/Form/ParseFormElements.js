const _ = require('lodash');

const mongo_cde = require('../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;

const parseAnswers = require('../Form/ParseAnswers').parseAnswers;

const CreateCDE = require('../CDE/CreateCDE');
const CompareCDE = require('../CDE/CompareCDE');
const MergeCDE = require('../CDE/MergeCDE');


const updatedByNonLoader = require('../../shared/updatedByNonLoader').updatedByNonLoader;
const batchloader = require('../../shared/updatedByNonLoader').batchloader;


doOneNindsCde = async cdeId => {
    let newCdeObj = await CreateCDE.createCde(cdeId);
    let newCde = new DataElement(newCdeObj);
    let existingCde = await DataElement.findOne({
        archived: false,
        'registrationState.registrationStatus': {$ne: 'Retired'},
        'ids.id': cdeId
    });
    let yesterday = new Date().setDate(new Date().getDate() - 1);
    if (!existingCde) {
        await newCde.save();
    } else if (updatedByNonLoader(existingCde) && existingCde.updated > yesterday) {
    } else {
        existingCde.imported = new Date().toJSON();
        existingCde.markModified('imported');
        let diff = CompareCDE.compareCde(newCde, existingCde);
        if (_.isEmpty(diff)) {
            await existingCde.save();
        } else {
            await MergeCDE.mergeCde(existingCde, newCde);
            await mongo_cde.updatePromise(existingCde, batchloader);
        }
    }
};

exports.parseFormElements = async nindsForms => {
    let formElements = [];

    let nindsQuestionList = [];
    let nindsCdeIdList = [];
    nindsForms.forEach(nindsForm => {
        if (!_.isEmpty(nindsForm.cdes))
            nindsQuestionList.push(nindsForm.cdes);
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde.cdeId)
                nindsCdeIdList.push(nindsCde.cdeId);
        })
    });

    let _nindsQuestionList = _.unionWith(nindsQuestionList, _.isEqual);
    let _nindsCdeIdList = _.uniq(nindsCdeIdList);

    if (_nindsQuestionList.length === 0) return formElements;
    if (_nindsQuestionList.length > 1) {
        console.log('More than one different question list found.');
        process.exit(1);
    }
    formElements.push({
        elementType: 'section',
        instructions: {value: ''},
        label: '',
        formElements: []
    });
    for (let nindsCdeId of _nindsCdeIdList) {
        await doOneNindsCde(nindsCdeId);
    }
    for (let nindsQuestion of _nindsQuestionList[0]) {
        let existingCde = await DataElement.findOne({
            "archived": false,
            "ids.id": nindsQuestion.cdeId,
            "registrationState.registrationStatus": {$ne: "Retired"}
        });
        if (!existingCde) {
            console.log(nindsQuestion.cdeId + ' not exists.');
            process.exit(1);
        }
        let question = {
            cde: {
                tinyId: existingCde.tinyId,
                name: existingCde.designations[0].designation,
                designations: existingCde.designations,
                version: existingCde.version,
                ids: existingCde.ids
            },
            datatype: existingCde.valueDomain.datatype,
            uom: existingCde.valueDomain.uom
        };
        if (question.datatype === 'Value List') {
            question.answers = parseAnswers(nindsQuestion);
            question.cde.permissibleValues = existingCde.valueDomain.permissibleValues;
            question.multiselect = nindsQuestion.inputRestrictions === 'Multiple Pre-Defined Values Selected';
        } else if (question.datatype === 'Text') {
            question.datatypeText = existingCde.valueDomain.datatypeText;
        } else if (question.datatype === 'Number') {
            question.datatypeNumber = existingCde.valueDomain.datatypeNumber;
        } else if (question.datatype === 'Date') {
            question.datatypeDate = existingCde.valueDomain.datatypeDate;
        } else if (question.datatype === 'File') {
            question.datatypeDate = existingCde.valueDomain.datatypeDate;
        } else {
            console.log('Unknown question.datatype: ' + question.datatype + ' cde id: ' + existingCde.ids[0].id);
            process.exit(1);
        }

        formElements[0].formElements.push({
            elementType: 'question',
            label: nindsQuestion.questionText,
            instructions: {value: nindsQuestion.instruction},
            question: question,
            formElements: []
        });
    }
    return formElements;
};