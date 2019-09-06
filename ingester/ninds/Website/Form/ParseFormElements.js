import { BATCHLOADER, updateCde } from 'ingester/shared/utility';
import { checkPvUnicity } from 'shared/de/deValidator';

const _ = require('lodash');

const mongo_cde = require('../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;
const DataElementSource = mongo_cde.DataElementSource;

const parseAnswers = require('../Form/ParseAnswers').parseAnswers;

const CreateCDE = require('../CDE/CreateCDE');
const CompareCDE = require('../CDE/CompareCDE');
const MergeCDE = require('../CDE/MergeCDE');

const Comment = require('../../../server/discuss/discussDb').Comment;

const updatedByNonLoader = require('../../shared/updatedByNonLoader').updatedByNonLoader;

let createdCDE = 0;
let sameCDE = 0;
let changeCDE = 0;
let skipCDE = 0;

const doOneNindsCde = async cdeId => {
    let newCdeObj = await CreateCDE.createCde(cdeId);
    let cdeError = checkPvUnicity(newCdeObj.valueDomain);
    if (cdeError && !cdeError.allValid) {
        if (cdeError.message === 'Value List must contain at least one Permissible Value') {
            let slComment = {
                text: 'NINDS Batch loader was not able to find PV Value List on ' + cdeId,
                user: BATCHLOADER,
                created: new Date(),
                pendingApproval: false,
                linkedTab: 'pvs',
                status: 'active',
                replies: [],
                element: {
                    eltType: 'cde'
                }
            };
            newCdeObj.comments.push(slComment);
            newCdeObj.valueDomain.datatype = 'Text';
            newCdeObj.valueDomain.permissibleValues = [];
        } else {
            console.log(newCdeObj.ids[0].id + ' has some other error. ' + JSON.stringify(cdeError));
            process.exit(1);
        }
    }

    let newCde = new DataElement(newCdeObj);
    let existingCde = await DataElement.findOne({
        archived: false,
        'registrationState.registrationStatus': {$ne: 'Retired'},
        'ids.id': cdeId
    });
    if (!existingCde) {
        for (let comment of newCdeObj.comments) {
            comment.element.eltId = newCde.tinyId;
            await new Comment(comment).save();
            console.log('comment saved on new CDE ' + newCde.tinyId);
        }
        let savedCDE = await newCde.save();
        createdCDE++;
        console.log('createdCDE: ' + createdCDE + ' ' + savedCDE.tinyId);
    } else {
        let existingCdeObj = existingCde.toObject();
        newCdeObj.tinyId = existingCdeObj.tinyId;
        let otherClassifications = existingCdeObj.classification.filter(c => c.stewardOrg.name !== 'NINDS');
        existingCde.classification = otherClassifications.concat(newCdeObj.classification);
        let yesterday = new Date().setDate(new Date().getDate() - 1);
        if (updatedByNonLoader(existingCde) ||
            existingCde.updated > yesterday ||
            existingCde.registrationState.registrationStatus === 'Standard') {
            await existingCde.save();
            skipCDE++;
            console.log('skipCDE: ' + skipCDE + ' ' + existingCde.tinyId);
        } else {
            existingCde.imported = new Date().toJSON();
            existingCde.markModified('imported');
            let diff = CompareCDE.compareCde(newCde, existingCde);

            if (_.isEmpty(diff)) {
                await existingCde.save();
                sameCDE++;
                console.log('sameCDE: ' + sameCDE + ' ' + existingCde.tinyId);
            } else {
                await MergeCDE.mergeCde(existingCde, newCde);
                await updateCde(existingCde, BATCHLOADER);
                changeCDE++;
                console.log('changeCDE: ' + changeCDE + ' ' + existingCde.tinyId);
            }
        }
    }
    await DataElementSource.update({tinyId: newCdeObj.tinyId}, newCdeObj, {upsert: true});
};

exports.parseFormElements = async nindsForms => {
    let formElements = [];

    let nindsQuestionList = [];
    let nindsCdeIdList = [];
    nindsForms.forEach(nindsForm => {
        if (!_.isEmpty(nindsForm.cdes)) {
            let questions = [];
            nindsForm.cdes.forEach(cde => {
                let _cde = _.cloneDeep(cde);
                delete _cde['Disease'];
                delete _cde['Domain'];
                delete _cde['Sub-Domain'];
                delete _cde['SubDisease'];
                questions.push(_cde);
            });
            nindsQuestionList.push(questions);
        }
        nindsForm.cdes.forEach(nindsCde => {
            if (nindsCde['CDE ID'])
                nindsCdeIdList.push(nindsCde['CDE ID']);
        })
    });

    let _nindsQuestionList = _.unionWith(nindsQuestionList, (a, b) => _.isEqual(a, b));
    let _nindsCdeIdList = _.uniq(nindsCdeIdList);

    if (_nindsQuestionList.length === 0) return formElements;

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
        let cdeId = nindsQuestion['CDE ID'];
        let existingCde = await DataElement.findOne({
            "archived": false,
            "ids.id": cdeId,
            "registrationState.registrationStatus": {$ne: "Retired"}
        });
        if (!existingCde) {
            console.log(cdeId + ' not exists.');
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
            question.multiselect = nindsQuestion['Instructions'] === 'Multiple Pre-Defined Values Selected';
        } else if (question.datatype === 'Text') {
            question.datatypeText = existingCde.valueDomain.datatypeText;
        } else if (question.datatype === 'Number') {
            question.datatypeNumber = existingCde.valueDomain.datatypeNumber;
        } else if (question.datatype === 'Date') {
            question.datatypeDate = {
                precision: "Minute"
            }
        } else if (question.datatype === 'File') {
            question.datatypeDate = existingCde.valueDomain.datatypeDate;
        } else {
            console.log('Unknown question.datatype: ' + question.datatype + ' cde id: ' + existingCde.ids[0].id);
            process.exit(1);
        }

        formElements[0].formElements.push({
            elementType: 'question',
            label: nindsQuestion['Question Text'],
            instructions: {value: nindsQuestion['Instructions']},
            question: question,
            formElements: []
        });
    }
    return formElements;
};