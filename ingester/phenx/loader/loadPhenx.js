const _ = require('lodash');

const MeasureModel = require('../../createMigrationConnection').MeasureModel;

const mongo_form = require('../../../server/form/mongo-form');
const Form = mongo_form.Form;
const CreateForm = require('../Form/CreateForm');
const CompareForm = require('../Form/CompareForm');
const MergeForm = require('../Form/MergeForm');

let measureCount = 0;
let protocolCount = 0;

let createdForm = 0;
let sameForm = 0;
let changeForm = 0;
let skipForm = 0;

let user = {username: 'batchloader'};

MeasureModel.find({}).cursor().eachAsync(async measure => {
    let measureObj = measure.toObject();
    console.log('Starting measurement: ' + measureObj.browserId);
    measureCount++;
    for (let protocol of measureObj.protocols) {
        let protocolId = protocol.protocolId;
        console.log('Starting protocol: ' + protocolId);
        protocolCount++;
        let newForm = await CreateForm.createForm(measureObj, protocol.protocol);
        let existingForm = await Form.fineOne({'ids.id': protocolId});
        if (!existingForm) {
            await newForm.save();
            created++;
            console.log('createdForm: ' + createdForm);
        } else if (existingForm.updated && existingForm.updated.username !== 'batchloader') {
            skipForm++;
            console.log('skipForm: ' + skipForm);
        } else {
            let diff = CompareForm.compareForm(newForm, existingForm);
            if (_.isEmpty(diff)) {
                existingForm.imported = new Date().toJSON();
                existingForm.markModified('imported');
                await existingForm.save();
                sameForm++;
                console.log('sameForm: ' + sameForm);
            } else {
                await MergeForm.mergeForm(existingForm, newForm);
                await mongo_form.updatePromise(existingForm, user)
                changeForm++;
                console.log('changeForm: ' + changeForm);
            }
        }
        console.log('Finished protocol: ' + protocolId);
    }
    console.log('Finished measurement: ' + measureObj.browserId);
}).then(() => {
    console.log('measureCount: ' + measureCount);
    console.log('protocolCount: ' + protocolCount);
}, error => console.log(error));