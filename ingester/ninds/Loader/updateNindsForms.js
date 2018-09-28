const _ = require('lodash');

const mongo_form = require('../../../server/form/mongo-form');
const DataElement = require('../../../server/cde/mongo-cde').DataElement;
const CreateForm = require('../Form/CreateForm');
const MergeForm = require('../Form/MergeForm');
const CompareForm = require('../Form/CompareForm');
const NindsFormModel = require('../../createMigrationConnection').NindsFormModel;

const user = {username: 'batchloader'};

let changed = 0;
let created = 0;
let same = 0;
let skip = 0;

doOne = migrationForm => {
    return new Promise(async (resolve, reject) => {
        let idObj = _.find(migrationForm.ids, o => o.source === 'NINDS');
        let migrationId = idObj.id;
        let cond = {
            "stewardOrg.name": "NINDS",
            "archived": false,
            "registrationState.registrationStatus": {$ne: "Retired"}
        };
        let existingForms = await DataElement.find(cond)
            .where("ids").elemMatch(elem => {
                elem.where("source").equals('NINDS');
                elem.where("id").equals(migrationId);
            }).exec();
        if (existingForms.length > 1) throw new Error('found more than 1 ' + migrationId);
        else if (existingForms.length === 0) {
            await new DataElement(migrationForm).save();
            console.log('created: ' + ++created);
        } else {
            let existingForm = existingForms[0];
            let diff = CompareForm.compareForm(migrationForm, existingForm);
            if (_.isEmpty(diff)) {
                existingForm.version = migrationForm.version;
                existingForm.ids = migrationForm.ids;
                await existingForm.save();
                same++;
            }
            else {
                if (existingForm.updatedBy.username && existingForm.updatedBy.username !== user.username) {
                    existingForm.registrationState.administrativeNote = "Because this Form was previously manually modified, no batch modification was applied. More information in attachments.";
                    await existingForm.save();
                    skip++;
                } else {
                    MergeForm.mergeForm(existingForm, migrationForm);
                    await mongo_form.updatePromise(existingForm, user);
                    console.log('changed: ' + ++changed);
                }
            }
        }
        resolve();
    });
};
retireForm = () => {
    return new Promise(async (resolve, reject) => {
        let cond = {
            "archived": false,
            "updatedBy.username": 'batchloader',
            "registrationState.registrationStatus": {$ne: "Retired"},
            "updated": {$lt: new Date().setHours(new Date().getHours() - 8)},
            "stewardOrg.name": "NINDS",
            "classification": {$size: 1},
            "classification.stewardOrg.name": 'NINDS'
        };
        let update = {
            'registrationState.registrationStatus': 'Retired',
            'registrationState.administrativeNote': 'Not present in import at ' + new Date().toJSON()
        };
        let retires = await Form.update(cond, update, {multi: true});
        console.log(retires.nModified + ' forms retired');
        resolve();
    })
};

function run() {
    NindsFormModel.find({}).cursor().eachAsync(ninds => {
        return new Promise(async (resolve, reject) => {
            let nindsObj = ninds.toObject();
            let migrationForm = await CreateForm.createForm(nindsObj);
            await doOne(migrationForm);
            ninds.remove();
            resolve();
        })
    }).then(async () => {
        await retireForm();
        console.log('changed: ' + changed + ' created: ' + created + ' same: ' + same + ' skip: ' + skip);
        process.exit(1);
    }, err => {
        throw err;
    });
}

run();

setInterval(function () {
    console.log('same: ' + same + ' changed: ' + changed + ' created: ' + created);
}, 5000);
