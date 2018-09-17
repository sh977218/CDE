const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const loincLoader = require('./../Website/loincLoader');

const loincId = '89070-7';
const orgName = 'External Forms';

async function run() {
    let loinc = await MigrationLoincModel.findOne({loincId: loincId});
    let newForm = await loincLoader.runOneForm(loinc.toObject(), orgName);
    console.log('existingForm: ' + newForm);
}

run();