const _ = require('lodash');

const mongo_cde = require('../../../server/cde/mongo-cde');
const mongo_data = require('../../../server/system/mongo-data');
const DataElement = mongo_cde.DataElement;
const MergeCDE = require('../CDE/MergeCDE');
const CompareCDE = require('../CDE/CompareCDE');
const MigrationDataElement = require('../../createMigrationConnection').MigrationDataElementModel;

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
        if (existingCdes.length > 1) throw new Error('found more than 1 ' + migrationId);
        else if (existingCdes.length === 0) {
            await new DataElement(migrationCde.toObject()).save();
            console.log('created: ' + ++created);
        } else {
            let existingCde = existingCdes[0];
            let diff = CompareCDE.compareCde(migrationCde, existingCde);
            if (_.isEmpty(diff)) {
                existingCde.version = migrationCde.version;
                existingCde.ids = migrationCde.ids;
                await existingCde.save();
                same++;
            }
            else {
                if (existingCde.updatedBy.username !== user.username) {
                    existingCde.registrationState.administrativeNote = "Because this CDE was previously manually modified, no batch modification was applied. More information in attachments.";
                    await existingCde.save();
                    skip++;
                } else {
                    MergeCDE.mergeCde(migrationCde, existingCde);
                    await mongo_cde.updatePromise(existingCde, user);
                    console.log('changed: ' + ++changed);
                }
            }
        }
        await migrationCde.remove();
        resolve();
    });
};

function run() {
    MigrationDataElement.find({}).cursor().eachAsync(async migrationCde => {
        await doOne(migrationCde);
    }).then(() => {
        console.log('changed: ' + changed + ' created: ' + created + ' same: ' + same);
        process.exit(1);
    }, err => {
        throw err;
    });
}

run();

setInterval(function () {
    console.log('same: ' + same + ' changed: ' + changed + ' created: ' + created);
}, 5000);