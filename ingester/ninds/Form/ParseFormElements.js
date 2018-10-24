const _ = require('lodash');

const mongo_cde = require('../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;

const parsePermissibleValues = require('../CDE/ParsePermissibleValues').parsePermissibleValues;

const CreateCDE = require('../CDE/CreateCDE');
const CompareCDE = require('../CDE/CompareCDE');
const MergeCDE = require('../CDE/MergeCDE');


const updatedByLoader = require('../../shared/updatedByLoader').updatedByLoader;
const batchloader = require('../../shared/updatedByLoader').batchloader;


doOneNindsCde = async cdeId => {
    let newCdeObj = await CreateCDE.createCde(cdeId);
    let newCde = new DataElement(newCdeObj);
    let existingCde = await DataElement.findOne({
        archived: false,
        'registrationState.registrationStatus': {$ne: 'Retired'},
        'ids.id': cdeId
    });
    if (!existingCde) {
        await newCde.save();
    } else if (updatedByLoader(existingCde)) {
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

    let questionList = [];
    let nindsCdeIdList = [];
    nindsForms.forEach(nindsForm => {
        if (!_.isEmpty(nindsForm.cdes))
            questionList.push(nindsForm.cdes);
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde.cdeId) nindsCdeIdList.push(nindsCde.cdeId);
        })
    });

    let uniqQuestionList = _.uniq(questionList, _.isEqual);
    let uniqNindsCdeIdList = _.uniq(nindsCdeIdList);

    if (uniqQuestionList.length === 0) return formElements;
    formElements.push({
        elementType: 'section',
        instructions: {value: ''},
        label: '',
        formElements: []
    });
    for (let nindsCdeId of uniqNindsCdeIdList) {
        await doOneNindsCde(nindsCdeId);
    }
    for (let nindsCde of uniqQuestionList) {
        let existingCde = await DataElement.findOne({
            "archived": false,
            "ids.id": nindsCde.cdeId,
            "registrationState.registrationStatus": {$ne: "Retired"}
        });
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
            question.answers = parsePermissibleValues(nindsCde);
            question.cde.permissibleValues = parsePermissibleValues(nindsCde);
            question.multiselect = cde.inputRestrictions === 'Multiple Pre-Defined Values Selected';
        } else if (question.datatype === 'Text') {
            question.datatypeText = existingCde.valueDomain.datatypeText;
        } else if (question.datatype === 'Number') {
            question.datatypeNumber = existingCde.valueDomain.datatypeNumber;
        } else if (question.datatype === 'Date') {
            question.datatypeDate = existingCde.valueDomain.datatypeDate;
        } else if (question.datatype === 'File') {
            question.datatypeDate = existingCde.valueDomain.datatypeDate;
        } else {
            throw 'Unknown question.datatype: ' + question.datatype + ' cde id: ' + existingCde.ids[0].id;
        }

        formElements[0].formElements.push({
            elementType: 'question',
            label: cde.questionText,
            instructions: {value: cde.instruction},
            question: question,
            formElements: []
        });
    }
};

parseFormElements = async ninds => {
    for (let cde of ninds.cdes) {
        let existingCde = await DataElement.findOne({
            archived: false,
            "registrationState.registrationStatus": {$ne: "Retired"},
            'ids.id': cde.cdeId
        });
        if (!existingCde) {
            console.log('cde: ' + cde.cdeId + ' not found.');
            throw new Error('cde: ' + cde.cdeId + ' not found.');
        }
        let existingV = (existingCde.ids.filter(o => o.source === 'NINDS'))[0].version;
        if (Number.parseFloat(existingV) !== Number.parseFloat(cde.versionNum)) {
            console.log(cde.cdeId + ' existing cde ' + existingV + ' not match cde: ' + cde.versionNum);
            throw new Error('version not match');
        }
    }
};
