import { BATCHLOADER, updateCde, updateForm } from 'ingester/shared/utility';
import { transferClassifications } from 'shared/system/classificationShared';

const _ = require('lodash');
const NindsModel = require('../../createMigrationConnection').NindsModel;

const mongo_form = require('../../../server/form/mongo-form');
const Form = mongo_form.formModel;
const FormSource = mongo_form.formSourceModel;
const DataElement = require('../../../server/cde/mongo-cde').dataElementModel;

const CreateForm = require('../Form/CreateForm');
const CompareForm = require('../Form/CompareForm');
const MergeForm = require('../Form/MergeForm');

const updatedByNonLoaderShared = require('../../shared/updatedByNonLoader');
const updatedByNonLoader = updatedByNonLoaderShared.updatedByNonLoader;
const batchloaderUsername = updatedByNonLoaderShared.BATCHLOADER_USERNAME;

const checkNullComments = require('../../shared/utility').checkNullComments;

let createdForm = 0;
let sameForm = 0;
let changeForm = 0;
let skipForm = 0;

let retiredCDE = 0;
let retiredForm = 0;

async function retireCdes() {
    let cond = {
        "ids.source": "NINDS",
        "archived": false,
        "registrationState.registrationStatus": {$ne: "Retired"},
        "imported": {$lt: new Date().setHours(new Date().getHours() - 8)},
        $where: 'this.classification.length < 2',
        $or: [
            {"updatedBy.username": batchloaderUsername},
            {
                $and: [
                    {"updatedBy.username": {$exists: false}},
                    {"createdBy.username": {$exists: true}}
                ]
            }
        ]
    };
    let cdes = await DataElement.find(cond);
    for (let cde of cdes) {
        let cdeObj = cde.toObject();
        cdeObj.registrationState.registrationStatus = 'Retired';
        cdeObj.registrationState.administrativeNote = 'Not present in import at ' + new Date().toJSON();
        await updateCde(cdeObj, BATCHLOADER);
        retiredCDE++;
    }
}

async function retiredForms() {
    let cond = {
        "ids.source": "NINDS",
        "archived": false,
        "registrationState.registrationStatus": {$ne: "Retired"},
        "imported": {$lt: new Date().setHours(new Date().getHours() - 8)},
        $or: [
            {"updatedBy.username": batchloaderUsername},
            {
                $and: [
                    {"updatedBy.username": {$exists: false}},
                    {"createdBy.username": {$exists: true}}
                ]
            }
        ]
    };
    let forms = await Form.find(cond);
    for (let form of forms) {
        let formObj = form.toObject();
        formObj.registrationState.registrationStatus = 'Retired';
        formObj.registrationState.administrativeNote = 'Not present in import at ' + new Date().toJSON();
        await updateForm(formObj, BATCHLOADER);
        retiredForm++;
    }
}

const doOneNindsFormById = async formIdString => {
    let formId = formIdString.replace('form', '').trim();
    let nindsForms = await NindsModel.find({formId: formIdString}).lean();
    let newFormObj = await CreateForm.createForm(nindsForms);
    let newForm = new Form(newFormObj);
    let existingForm = await Form.findOne({
        archived: false,
        'registrationState.registrationStatus': {$ne: 'Retired'},
        'ids.id': formId
    });
    if (!existingForm) {
        let savedForm = await newForm.save();
        for (let comment of newFormObj.comments) {
            comment.element.eltId = savedForm.tinyId;
            await new Comment(comment).save();
            console.log('comment saved on new Form ' + newForm.tinyId);
        }
        createdForm++;
        console.log('createdForm: ' + createdForm + ' ' + savedForm.tinyId);
    } else {
        let existingFormObj = existingForm.toObject();
        newFormObj.tinyId = existingFormObj.tinyId;

        if (existingForm.tinyId === 'mJsGoMU1m') {
            transferClassifications(newFormObj, existingForm);
        } else {
            let otherClassifications = existingFormObj.classification.filter(c => c.stewardOrg.name !== 'NINDS');
            existingForm.classification = otherClassifications.concat(newFormObj.classification);
        }
        //@TODO remove after this load.
        existingForm.classification.forEach(c => {
            if (c.stewardOrg.name === 'NINDS') {
                c.elements = c.elements.filter(e => e.name !== 'Population');
            }
        });

        if (updatedByNonLoader(existingForm) ||
            existingForm.registrationState.registrationStatus === 'Standard') {
            await existingForm.save();
            skipForm++;
            console.log('skipForm: ' + skipForm + ' ' + existingForm.tinyId);
        } else {
            existingForm.markModified('imported');
            existingForm.imported = new Date().toJSON();
            let diff = CompareForm.compareForm(newForm, existingForm);
            for (let comment of newFormObj.comments) {
                comment.element.eltId = existingForm.tinyId;
                await new Comment(comment).save();
                console.log('comment saved on existing Form ' + existingForm.tinyId);
            }
            if (_.isEmpty(diff)) {
                await existingForm.save();
                sameForm++;
                console.log('sameForm: ' + sameForm + ' ' + existingForm.tinyId);
            } else {
                await MergeForm.mergeForm(existingForm, newForm);
                await updateForm(existingForm, BATCHLOADER);
                changeForm++;
                console.log('changeForm: ' + changeForm + ' ' + existingForm.tinyId);
            }
        }
    }
    await formSourceModel.update({tinyId: newFormObj.tinyId}, newFormObj, {upsert: true});
};

run = async () => {
    let formIdList = await NindsModel.distinct('formId');
//    let formIdList = ['formF0374', 'formF2032'];
    for (let formId of formIdList) {
        await doOneNindsFormById(formId);
    }
    let nullComments = await checkNullComments();
    for (let nullComment of nullComments) {
        console.log(nullComment.element.eltType + ' has null comment ' + nullComment._id);
    }
};


run().then(async () => {
    await retireCdes();
    console.log('retiredCDE: ' + retiredCDE);
    await retiredForms();
    console.log('retiredForm: ' + retiredForm);

    console.log('Finished NINDS loader. ');
    process.exit(1);
}, error => console.log(error));
