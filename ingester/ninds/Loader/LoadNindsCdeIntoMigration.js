const MigrationNindsModel = require('../../createMigrationConnection').MigrationNindsModel;
const MigrationDataElementModel = require('../../createMigrationConnection').MigrationDataElementModel;
const MigrationOrgModel = require('../../createMigrationConnection').MigrationOrgModel;

const CreateCDE = require('../CDE/CreateCDE');
const MergeCDE = require('../../loinc/CDE/MergeCDE');

let cdeCounter = 0;

async function run() {
    await MigrationDataElementModel.remove({name: 'NINDS'});
    console.log("Migration Data Element removed.");
    let nindsOrg = await MigrationOrgModel.findOne({name: 'NINDS'});
    if (!nindsOrg)
        nindsOrg = await new MigrationOrgModel({name: "NINDS", classification: []}).save();
    let cursor = MigrationNindsModel.find({}).cursor();
    cursor.eachAsync(ninds => {
        if (ninds.toObject) ninds = ninds.toObject();
        return new Promise(async (resolve, reject) => {
            let cdes = ninds.cdes;
            if (cdes.length === 0) resolve();
            for (let cde of cdes) {
                let existingCdes = await MigrationDataElementModel.find({'ids.id': cde.cdeId});
                if (existingCdes.length > 1)
                    throw new Error(existingCdes.length + ' cdes found, ids.id:' + cde.cdeId);
                let newCde = CreateCDE.createCde(cde, ninds, nindsOrg);
                if (existingCdes.length === 0) {
                    await new MigrationDataElementModel(newCde).save();
                    cdeCounter++;
                    console.log('cdeCounter: ' + cdeCounter);
                } else {
                    let existingCde = existingCdes[0];
                    await MergeCDE.mergeCde(newCde, existingCde, ninds);
                    await existingCde.save();
                }
            }
            resolve();
        })
    }).then(async () => {
        await nindsOrg.save();
        process.exit(1);
    });
}

run();