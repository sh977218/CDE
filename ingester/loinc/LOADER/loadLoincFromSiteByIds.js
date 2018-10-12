const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const loincLoader = require('./../Website/loincLoader');

const loincId = '86636-8';

async function run() {
    await MigrationLoincModel.remove({loincId: loincId});
    console.log('Migration loinc collection removed.');
    loincLoader.runOneLoinc(loincId).then(loinc => {
        new MigrationLoincModel(loinc).save();
    }, err => console.log(err));
}

run();