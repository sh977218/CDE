const _ = require('lodash');

const mongo_cde = require('../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;
const MergeCDE = require('../../loinc/CDE/MergeCDE');
const MigrationDataElement = require('../../createMigrationConnection').MigrationDataElementModel;

const user = {username: 'batchloader'};

let changed = 0;
let created = 0;
let same = 0;

doOne = migrationCde => {
    return new Promise(async (resolve, reject) => {
        let idObj = _.find(migrationCde.ids, o => o.source === 'NINDS');
        let migrationId = idObj.id;
        let migrationVersion = idObj.version;
        let cond = {
            "stewardOrg.name": "NINDS",
            "archived": false,
            "registrationState.registrationStatus": {$ne: "Retired"}
        };
        let existingCdes = await DataElement.find(cond)
            .elemMatch("ids", {source: 'NINDS', id: migrationId, version: migrationVersion}).exec();
        if (existingCdes.length > 1) throw new Error('found more than 1 ' + migrationId);
        if (existingCdes.length === 0) {
            await new DataElement(migrationCde.toObject()).save();
            console.log('created: ' + ++created);
        } else {
            let existingCde = existingCdes[0];
            let diff = MergeCDE.compareCdes(migrationCde, existingCde);
            if (!_.isEmpty(diff)) {
                MergeCDE.mergeCde(migrationCde, existingCde);
                await mongo_cde.updatePromise(existingCde, user);
                console.log('changed: ' + ++changed);
            } else console.log('same: ' + ++same);
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
};

run();