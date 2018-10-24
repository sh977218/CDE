const _ = require('lodash');
const MigrationNindsModel = require('../../createMigrationConnection').MigrationNindsModel;

const mongo_form = require('../../../server/form/mongo-form');
const Form = mongo_form.Form;

const CreateForm = require('../Form/CreateForm');
const CompareForm = require('../Form/CompareForm');
const MergeForm = require('../Form/MergeForm');

const updatedByLoader = require('../../shared/updatedByLoader').updatedByLoader;
const batchloader = require('../../shared/updatedByLoader').batchloader;

let createdForm = 0;
let sameForm = 0;
let changeForm = 0;
let skipForm = 0;

doOneNindsForm = async formId => {
    let nindsForms = await MigrationNindsModel.find({formId: formId}).lean();
    let newFormObj = await CreateForm.createForm(nindsForms);
    let newForm = new Form(newFormObj);
    let existingForm = await Form.findOne({
        archived: false,
        'registrationState.registrationStatus': {$ne: 'Retired'},
        'ids.id': formId
    });
    if (!existingForm) {
        await newForm.save();
        createdForm++;
        console.log('createdForm: ' + createdForm);
    } else if (updatedByLoader(existingForm)) {
        skipForm++;
        console.log('skipForm: ' + skipForm);
    } else {
        existingForm.imported = new Date().toJSON();
        existingForm.markModified('imported');
        let diff = CompareForm.compareForm(newForm, existingForm);
        if (_.isEmpty(diff)) {
            await existingForm.save();
            sameForm++;
            console.log('sameForm: ' + sameForm);
        } else {
            await MergeForm.mergeForm(existingForm, newForm);
            await mongo_form.updatePromise(existingForm, batchloader);
            changeForm++;
            console.log('changeForm: ' + changeForm);
        }
    }
};

run = async () => {
    let formIdList = await MigrationNindsModel.distinct('formId');
    for (let formId of formIdList) {
        await doOneNindsForm(formId);
    }
};


run().then(() => {
}, error => console.log(error));