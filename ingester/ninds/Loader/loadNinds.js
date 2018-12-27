const _ = require('lodash');
const NindsModel = require('../../createMigrationConnection').NindsModel;

const mongo_form = require('../../../server/form/mongo-form');
const Form = mongo_form.Form;
const mongo_cde = require('../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;

const CreateForm = require('../Form/CreateForm');
const CompareForm = require('../Form/CompareForm');
const MergeForm = require('../Form/MergeForm');

const updatedByNonLoader = require('../../shared/updatedByNonLoader').updatedByNonLoader;
const batchloader = require('../../shared/updatedByNonLoader').batchloader;

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
            {"updatedBy.username": "batchloader"},
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
        cde.registrationState.registrationStatus = 'Retired';
        cde.registrationState.administrativeNote = 'Not present in import at ' + new Date().toJSON();
        cde.markModified('registrationState');
        await DataElement.findOneAndUpdate({_id: cde._id}, cde).exec();
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
            {"updatedBy.username": "batchloader"},
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
        form.registrationState.registrationStatus = 'Retired';
        form.registrationState.administrativeNote = 'Not present in import at ' + new Date().toJSON();
        form.markModified('registrationState');
        await form.save();
        retiredForm++;
    }
}


doOneNindsFormById = async formIdString => {
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
        createdForm++;
        console.log('createdForm: ' + createdForm + ' ' + savedForm.tinyId);
    } else if (updatedByNonLoader(existingForm) ||
        existingForm.registrationState.registrationStatus === 'Standard') {
        skipForm++;
        console.log('skipForm: ' + skipForm + ' ' + existingForm.tinyId);
    } else {
        existingForm.imported = new Date().toJSON();
        existingForm.markModified('imported');
        let diff = CompareForm.compareForm(newForm, existingForm);
        if (_.isEmpty(diff)) {
            await existingForm.save();
            sameForm++;
            console.log('sameForm: ' + sameForm + ' ' + existingForm.tinyId);
        } else {
            await MergeForm.mergeForm(existingForm, newForm);
            await mongo_form.updatePromise(existingForm, batchloader);
            changeForm++;
            console.log('changeForm: ' + changeForm + ' ' + existingForm.tinyId);
        }
    }
};

run = async () => {
    let formIdList = await NindsModel.distinct('formId');
//    let formIdList = ['formF2032'];
    for (let formId of formIdList) {
        await doOneNindsFormById(formId);
        await NindsModel.remove({formId: formId});
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
