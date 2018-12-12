const _ = require('lodash');

const MeasureModel = require('../../createMigrationConnection').MeasureModel;

const mongo_form = require('../../../server/form/mongo-form');
const Form = mongo_form.Form;
const CreateForm = require('../Form/CreateForm');
const CompareForm = require('../Form/CompareForm');
const MergeForm = require('../Form/MergeForm');

const batchloader = require('../../shared/updatedByLoader').batchloader;

let measureCount = 0;
let protocolCount = 0;

let createdForm = 0;
let sameForm = 0;
let changeForm = 0;
let retiredForm = 0;

retireForms = async () => {
    let cond = {
        "ids.source": "PhenX",
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
};

run = () => {
    let cond = {};
    MeasureModel.find(cond).cursor({batchSize: 1, useMongooseAggCursor: true})
        .eachAsync(async measure => {
            let measureObj = measure.toObject();
            console.log('Starting measurement: ' + measureObj.browserId);
            measureCount++;
            if (measureObj.protocols) {
                for (let protocol of measureObj.protocols) {
                    let protocolId = protocol.protocolId;
                    console.log('Starting protocol: ' + protocolId);
                    protocolCount++;
                    let newFormObj = await CreateForm.createForm(measureObj, protocol);
                    let newForm = new Form(newFormObj);
                    let existingForm = await Form.findOne({
                        archived: false,
                        'registrationState.registrationStatus': {$ne: 'Retired'},
                        'ids.id': protocolId
                    });
                    if (!existingForm) {
                        await newForm.save();
                        createdForm++;
                        console.log('createdForm: ' + createdForm);
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
                            existingForm.changeNote = '';
                            await mongo_form.updatePromise(existingForm, batchloader);
                            changeForm++;
                            console.log('changeForm: ' + changeForm);
                        }
                    }
                    console.log('Finished protocol: ' + protocolId);
                }
            }
            console.log('Finished measurement: ' + measureObj.browserId);
            await measure.remove();
        }).then(async () => {
        console.log('************************************************');
        await retireForms();
        console.log('Finished PhenX Loader: ');
        console.log('createdForm: ' + createdForm);
        console.log('changeForm: ' + changeForm);
        console.log('sameForm: ' + sameForm);
        console.log('retiredForm: ' + retiredForm);
    }, error => console.log(error));
};

run();
