const _ = require('lodash');
const NindsModel = require('../../createMigrationConnection').NindsModel;

const mongo_form = require('../../../server/form/mongo-form');
const Form = mongo_form.Form;

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

async function retireCdes() {

}

async function retiredForms() {

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
    } else if (updatedByNonLoader(existingForm)) {
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
//  let formIdList = ['formF1336'];
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
    await retiredForms();
}, error => console.log(error));
