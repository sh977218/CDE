const _ = require('lodash');

const mongo_form = require('../../../server/form/mongo-form');
const Form = require('../../../server/form/mongo-form').Form;
const CreateForm = require('../Form/CreateForm');
const MergeForm = require('../Form/MergeForm');
const CompareForm = require('../Form/CompareForm');
const NindsFormModel = require('../../createMigrationConnection').NindsFormModel;

const user = {username: 'batchloader'};

let changed = 0;
let created = 0;
let same = 0;
let skip = 0;
let totalNinds = 0;

doOne = migrationForm => {
    return new Promise(async (resolve, reject) => {
        let idObj = _.find(migrationForm.ids, o => o.source === 'NINDS');
        let migrationId = idObj.id;
        let migrationVersion = idObj.version;
        let cond = {
            "stewardOrg.name": "NINDS",
            "archived": false,
            "registrationState.registrationStatus": {$ne: "Retired"}
        };
        let existingForms = await Form.find(cond)
            .where("ids").elemMatch(elem => {
                elem.where("source").equals('NINDS');
                elem.where("id").equals(migrationId);
                elem.where("version").equals(Number.parseFloat(migrationVersion).toString());
            }).exec();
        if (existingForms.length > 1) throw new Error('found more than 1 ' + migrationId);
        else if (existingForms.length === 0) {
            await migrationForm.save();
            created++;
        } else {
            let existingForm = existingForms[0];
            let diff = CompareForm.compareForm(migrationForm, existingForm);
            if (_.isEmpty(diff)) same++;
            else {
                if (existingForm.updatedBy && existingForm.updatedBy.username && existingForm.updatedBy.username !== user.username) {
                    existingForm.registrationState.administrativeNote = "Because this Form was previously manually modified, no batch modification was applied. More information in attachments.";
                    await existingForm.save();
                    skip++;
                } else {
                    MergeForm.mergeForm(existingForm, migrationForm);
                    await mongo_form.updatePromise(existingForm, user);
                    changed++;
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

async function run() {
    totalNinds = await NindsFormModel.count({});
    NindsFormModel.find({}).cursor().eachAsync(ninds => {
        return new Promise(async (resolve, reject) => {
            let nindsObj = ninds.toObject();
            let nindsForm = await CreateForm.createForm(nindsObj);
            await doOne(new Form(nindsForm));
            ninds.remove();
            totalNinds--;
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

run().then();

setInterval(function () {
    console.log('changed: ' + changed + ' created: ' + created + ' same: ' + same + ' skip: ' + skip + ' totalNinds: ' + totalNinds);
}, 5000);
