const _ = require('lodash');
const Form = require('../../../server/form/mongo-form').Form;

const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const CreateForm = require('../Form/CreateForm');
const MergeForm = require('../Form/MergeForm');
const orgName = 'External Forms';

const loincId = '89070-7';

let today = new Date().toJSON();

async function run() {

    let created = 0;
    let merged = 0;
    let same = 0;

    let loincForm = await MigrationLoincModel.findOne({loinc: loincId});
    let newForm = await CreateForm.createForm(loincForm.toObject(), orgName);

    let formCond = {
        archived: false,
        source: 'LOINC',
        "registrationState.registrationStatus": {$not: /Retired/},
        imported: {$ne: today}
    };
    let existingForm = await Form.findOne(formCond).where("ids").elemMatch(function (elem) {
        elem.where("source").equals('LOINC');
        elem.where("id").equals(loincId);
    }).exec();
    if (!existingForm) {
        newForm.imported = today;
        newForm.updated = today;
        newForm.created = today;
        await new Form(newForm).save();
        console.log('created: ' + ++created);
    } else {
        let diff = MergeForm.compareForms(newForm, existingForm);
        if (_.isEmpty(diff)) console.log('same: ' + ++same);
        else {
            await MergeForm.mergeForm(newForm, existingForm, orgName).catch(e => {
                reject(e);
            });
            console.log('merged: ' + ++merged);
        }
    }
    console.log("finished " + loincId);
}

run().then(() => {
    process.exit(1);
}).catch(e => {
    throw e
});