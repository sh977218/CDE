const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const orgMapping = require('../Mapping/ORG_INFO_MAP').map;
const loincLoader = require('./../Website/loincLoader');

let classifi = {
    '86636-8': ['FPAR']
};

async function run() {
    if (process.argv.length !== 4) {
        console.log('pass loinc id into argv. number argv ' + argv.length);
        process.exit(1);
    }
    let loincId = process.argv[2];
    console.log('***********Starting loading loinc Id ' + loincId);
    let orgName = process.argv[3];
    console.log('***********Into org ' + orgName);
    let orgInfo = orgMapping[orgName];
    orgInfo.classification = classifi[loincId];
    let loinc = await MigrationLoincModel.findOne({loincId: loincId});
    await loincLoader.runOneForm(loinc.toObject(), orgInfo);
    console.log('***********Finished loading loinc Id ' + loincId);
}

run().then();