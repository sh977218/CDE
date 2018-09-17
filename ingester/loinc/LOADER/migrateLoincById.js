const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const loincLoader = require('./../Website/loincLoader');

async function run() {
    if (process.argv.length !== 4) {
        console.log('pass loinc id into argv. number argv ' + argv.length);
        process.exit(1);
    }
    let loincId = process.argv[2];
    console.log('***********Start loading loinc Id ' + loincId);
    let orgName = process.argv[3];
    console.log('***********Into org ' + orgName);
    let loinc = await MigrationLoincModel.findOne({loincId: loincId});
    let newForm = await loincLoader.runOneForm(loinc.toObject(), orgName);
    console.log('existingForm: ' + newForm);
}

run();