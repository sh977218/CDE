const _ = require('lodash');
const MigrationNindsModel = require('../../createMigrationConnection').MigrationNindsModel;
const MigrationFormModel = require('../../createMigrationConnection').MigrationFormModel;

const CreateForm = require('../Form/CreateForm');
const MergeForm = require('../Form/MergeForm');
const CompareForm = require('../Form/CompareForm');

let merged = 0;
let created = 0;
let same = 0;

let totalForm = 0;

function run() {
    return new Promise(async (resolve, reject) => {
        await MigrationFormModel.remove({});
        console.log("Migration Form removed.");
        let nindsOrg = await MigrationOrgModel.findOne({name: 'NINDS'});
        if (!nindsOrg) nindsOrg = await new MigrationOrgModel({name: "NINDS", classification: []}).save();
        MigrationNindsModel.find({}).cursor().eachAsync(ninds => {
            if (ninds.toObject) ninds = ninds.toObject();
            return new Promise(async (resolve, reject) => {
                let form = ninds.toObject();
                totalForm++;
                let existingForms = await MigrationForm.find({'ids.id': form.formId});
                if (existingForms.length > 1)
                    throw new Error(existingForms.length + ' forms found, ids.id:' + form.formId);
                let newForm = CreateForm.createForm(form, nindsOrg);
                if (existingForms.length === 0) {
                    await new MigrationFormModel(existingForms).save();
                    created++;
                } else {
                    let existingForm = existingForms[0];
                    let diff = CompareForm.compareForm(newForm, existingForm);
                    if (!_.isEmpty(diff)) {
                        MergeForm.mergeForm(newForm, existingForm);
                        await existingForm.save();
                        merged++;
                    } else same++;
                }
                resolve();
            })
        }).then(async () => {
            await nindsOrg.save();
            resolve();
        })
    })
}

run().then(() => {
    console.log('totalForm: ' + totalForm);
    console.log('same: ' + merged + ' created: ' + created + ' merged: ' + merged);
    process.exit(1);
});

setInterval(function () {
    console.log('same: ' + same + ' created: ' + created + ' merged: ' + merged);
}, 5000);