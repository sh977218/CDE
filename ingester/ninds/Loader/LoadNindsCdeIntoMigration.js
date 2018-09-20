const _ = require('lodash');
const MigrationNindsModel = require('../../createMigrationConnection').MigrationNindsModel;
const MigrationDataElementModel = require('../../createMigrationConnection').MigrationDataElementModel;
const MigrationOrgModel = require('../../createMigrationConnection').MigrationOrgModel;

const CreateCDE = require('../CDE/CreateCDE');
const MergeCDE = require('../../loinc/CDE/MergeCDE');

let merged = 0;
let created = 0;
let same = 0;

let totalCDE = 0;

function run() {
    return new Promise(async (resolve, reject) => {
        await MigrationDataElementModel.remove({});
        console.log("Migration Data Element removed.");
        let nindsOrg = await MigrationOrgModel.findOne({name: 'NINDS'});
        if (!nindsOrg)
            nindsOrg = await new MigrationOrgModel({name: "NINDS", classification: []}).save();
        MigrationNindsModel.find({}).cursor().eachAsync(ninds => {
            if (ninds.toObject) ninds = ninds.toObject();
            return new Promise(async (resolve, reject) => {
                let cdes = ninds.cdes;
                if (cdes.length === 0) resolve();
                for (let cde of cdes) {
                    totalCDE++;
                    let existingCdes = await MigrationDataElementModel.find({'ids.id': cde.cdeId});
                    if (existingCdes.length > 1)
                        throw new Error(existingCdes.length + ' cdes found, ids.id:' + cde.cdeId);
                    let newCde = CreateCDE.createCde(cde, ninds, nindsOrg);
                    if (existingCdes.length === 0) {
                        await new MigrationDataElementModel(newCde).save();
                        console.log('created: ' + ++created);
                    } else {
                        let existingCde = existingCdes[0];
                        let diff = MergeCDE.compareCdes(newCde, existingCde);
                        if (!_.isEmpty(diff)) {
                            MergeCDE.mergeCde(newCde, existingCde);
                            await existingCde.save();
                            console.log('merged: ' + ++merged);
                        } else console.log('same: ' + ++same);
                    }
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
    console.log('same: ' + merged);
    console.log('created: ' + created);
    console.log('merged: ' + merged);
    console.log('totalCDE: ' + totalCDE);
    process.exit(1);
});