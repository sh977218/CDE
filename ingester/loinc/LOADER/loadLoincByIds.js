const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const LOINCLoader = require('./../Website/LOINCLoader');

const loincId = '89070-7';

const currentVersion = '2.64';

async function run() {
    await MigrationLoincModel.remove({loinc: loincId});
    console.log('Migration loinc collection removed.');
    LOINCLoader.runOne(loincId).then(loinc => {
        new MigrationLoincModel(loinc).save();
    }, err => console.log(err));
}

run();