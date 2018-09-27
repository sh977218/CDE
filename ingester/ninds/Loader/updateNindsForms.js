const _ = require('lodash');

const mongo_form = require('../../../server/form/mongo-form');
const mongo_data = require('../../../server/system/mongo-data');
const Form = mongo_form.Form;
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
            await new DataElement(migrationForm.toObject()).save();
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
                if (existingForm.updatedBy.username !== user.username) {
                    existingForm.registrationState.administrativeNote = "Because this Form was previously manually modified, no batch modification was applied. More information in attachments.";
                    await existingForm.save();
                    skip++;
                } else {
                    MergeForm.mergeForm(existingForm, migrationForm);
                    await mongo_Form.updatePromise(existingForm, user);
                    console.log('changed: ' + ++changed);
                }
            }
        }
        resolve();
    });
};

function run() {
    NindsFormModel.find({}).lean().cursor().eachAsync(async form => {
        let migrationForm = await CreateForm.createForm(form);
        await doOne(migrationForm);
    }).then(() => {
        console.log('changed: ' + changed + ' created: ' + created + ' same: ' + same);
        process.exit(1);
    }, err => {
        throw err;
    });
}

run();

setInterval(function () {
    console.log('same: ' + same + ' changed: ' + changed + ' created: ' + created);
}, 5000);
