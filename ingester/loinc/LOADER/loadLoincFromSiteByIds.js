const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const loincLoader = require('./../Website/loincLoader');

const loincId = '62280-3';

async function run() {
    await MigrationLoincModel.remove({loincId: loincId});
    console.log('Migration loinc collection removed.');
    let loinc = await loincLoader.runOneLoinc(loincId);
    new MigrationLoincModel(loinc).save();
}

run().then(() => {
}, err => console.log(err));