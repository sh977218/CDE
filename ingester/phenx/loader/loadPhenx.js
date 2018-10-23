const _ = require('lodash');

const MeasureModel = require('../../createMigrationConnection').MeasureModel;

const mongo_Cde = require('../../../server/cde/mongo-cde');
const DataElement = mongo_Cde.DataElement;
const mongo_form = require('../../../server/form/mongo-form');
const Form = mongo_form.Form;
const CreateForm = require('../Form/CreateForm');
const CompareForm = require('../Form/CompareForm');
const MergeForm = require('../Form/MergeForm');

const updatedByLoader = require('../../shared/updatedByLoader').updatedByLoader;
const batchloader = require('../../shared/updatedByLoader').batchloader;

let measureCount = 0;
let protocolCount = 0;

let createdForm = 0;
let sameForm = 0;
let changeForm = 0;
let skipForm = 0;

retireCdes = async () => {
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
    let update = {
        'registrationState.registrationStatus': 'Retired',
        'registrationState.administrativeNote': 'Not present in import at ' + new Date().toJSON()
    };
    let retires = await DataElement.update(cond, update, {multi: true});
    console.log(retires.nModified + ' cdes retired');
};

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
    let update = {
        'registrationState.registrationStatus': 'Retired',
        'registrationState.administrativeNote': 'Not present in import at ' + new Date().toJSON()
    };
    let retires = await Form.update(cond, update, {multi: true});
    console.log(retires.nModified + ' forms retired');
};

let cond = {};
//let cond = {'protocols.protocolId': '150101'};
MeasureModel.find(cond).cursor().eachAsync(async measure => {
    let measureObj = measure.toObject();
    console.log('Starting measurement: ' + measureObj.browserId);
    measureCount++;
    if (measureObj.protocols) {
        for (let protocol of measureObj.protocols) {
            let protocolId = protocol.protocolId;
            console.log('Starting protocol: ' + protocolId);
            protocolCount++;
            let newFormObj = await CreateForm.createForm(measureObj, protocol.protocol);
            let newForm = new Form(newFormObj);
            let existingForm = await Form.findOne({archived: false, 'ids.id': protocolId});
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
            console.log('Finished protocol: ' + protocolId);
        }
    }
    console.log('Finished measurement: ' + measureObj.browserId);
    await measure.remove();
}).then(async () => {
    console.log('measureCount: ' + measureCount);
    console.log('protocolCount: ' + protocolCount);
    await retireCdes();
    await retireForms();
}, error => console.log(error));
