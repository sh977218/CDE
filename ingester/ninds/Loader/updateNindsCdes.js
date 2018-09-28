const _ = require('lodash');

const mongo_cde = require('../../../server/cde/mongo-cde');
const mongo_data = require('../../../server/system/mongo-data');
const DataElement = mongo_cde.DataElement;
const CreateCDE = require('../CDE/CreateCDE');
const MergeCDE = require('../CDE/MergeCDE');
const CompareCDE = require('../CDE/CompareCDE');
const NindsCdeModel = require('../../createMigrationConnection').NindsCdeModel;

const user = {username: 'batchloader'};

let changed = 0;
let created = 0;
let same = 0;
let skip = 0;

doOne = migrationCde => {
    return new Promise(async (resolve, reject) => {
        let idObj = _.find(migrationCde.ids, o => o.source === 'NINDS');
        let migrationId = idObj.id;
        let cond = {
            "stewardOrg.name": "NINDS",
            "archived": false,
            "registrationState.registrationStatus": {$ne: "Retired"}
        };
        let existingCdes = await DataElement.find(cond)
            .where("ids").elemMatch(elem => {
                elem.where("source").equals('NINDS');
                elem.where("id").equals(migrationId);
            }).exec();
        if (existingCdes.length > 1) {
            console.log('found more than 1 ' + migrationId);
            process.exit(1);
        } else if (existingCdes.length === 0) {
            await new DataElement(migrationCde).save();
            console.log('created: ' + ++created);
        } else {
            let existingCde = existingCdes[0];
            let diff = CompareCDE.compareCde(migrationCde, existingCde);
            if (_.isEmpty(diff)) {
                existingCde.ids = migrationCde.ids;
                await existingCde.save();
                same++;
            }
            else {
                if (existingCde.updatedBy.username && existingCde.updatedBy.username !== user.username) {
                    existingCde.registrationState.administrativeNote = "Because this CDE was previously manually modified, no batch modification was applied. More information in attachments.";
                    await existingCde.save();
                    skip++;
                } else {
                    MergeCDE.mergeCde(existingCde, migrationCde);
                    await mongo_cde.updatePromise(existingCde, user);
                    console.log('changed: ' + ++changed);
                }
            }
        }
        resolve();
    });
};

retireCde = () => {
    return new Promise(async (resolve, reject) => {
        let cond = {
            "archived": false,
            "updatedBy.username": 'batchloader',
            "registrationState.registrationStatus": {$ne: "Retired"},
            "updated": {$lt: new Date().setHours(new Date().getHours() - 8)},
            "stewardOrg.name": "NINDS",
            "classification": {$size: 1},
            "classification.stewardOrg.name": 'NINDS'
        };
        let update = {
            'registrationState.registrationStatus': 'Retired',
            'registrationState.administrativeNote': 'Not present in import at ' + new Date().toJSON()
        };
        let retires = await DataElement.update(cond, update, {multi: true});
        console.log(retires.nModified + ' cdes retired');
        resolve();
    })
};

function run() {
    NindsCdeModel.find({}).cursor().eachAsync(ninds => {
        let nindsObj = ninds.toObject();
        return new Promise(async (resolve, reject) => {
            let migrationCde = CreateCDE.createCde(nindsObj);
            await doOne(migrationCde);
            ninds.remove();
            resolve();
        })
    }).then(async () => {
        await retireCde();
        console.log('changed: ' + changed + ' created: ' + created + ' same: ' + same + ' skip: ' + skip);
        process.exit(1);
    }, err => {
        throw err;
    });
}

run();

setInterval(function () {
    console.log('same: ' + same + ' changed: ' + changed + ' created: ' + created);
}, 5000);