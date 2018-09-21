const _ = require('lodash');
const MigrationNindsModel = require('../../createMigrationConnection').MigrationNindsModel;
const MigrationDataElementModel = require('../../createMigrationConnection').MigrationDataElementModel;
const MigrationOrgModel = require('../../createMigrationConnection').MigrationOrgModel;

const CreateCDE = require('../CDE/CreateCDE');
const MergeCDE = require('../CDE/MergeCDE');
const CompareCDE = require('../CDE/CompareCDE');

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
                        created++;
                    } else {
                        let existingCde = existingCdes[0];
                        let diff = CompareCDE.compareCde(newCde, existingCde);
                        if (!_.isEmpty(diff)) {
                            MergeCDE.mergeCde(newCde, existingCde);
                            await existingCde.save();
                            merged++;
                        } else same++;
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
    console.log('same: ' + merged + ' created: ' + created + ' merged: ' + merged);
    console.log('totalCDE: ' + totalCDE);
    process.exit(1);
});

setInterval(function () {
    console.log('same: ' + same + ' created: ' + created + ' merged: ' + merged);
}, 5000);