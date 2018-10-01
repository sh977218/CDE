const _ = require('lodash');

const mongo_cde = require('../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;
const CreateCDE = require('../CDE/CreateCDE');
const MergeCDE = require('../CDE/MergeCDE');
const CompareCDE = require('../CDE/CompareCDE');
const NindsCdeModel = require('../../createMigrationConnection').NindsCdeModel;

const user = {username: 'batchloader'};

let changed = 0;
let created = 0;
let same = 0;
let totalNinds = 0;

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
            .where("ids").elemMatch(elem => {
                elem.where("source").equals('NINDS');
                elem.where("id").equals(migrationId);
//                elem.where("version").equals(migrationVersion);
            }).exec();
        existingCdes = existingCdes.filter(e => {
            let v = e.version;
            return Number.parseFloat(v).toString() === Number.parseFloat(migrationVersion).toString();
        });
        if (existingCdes.length > 1) {
            console.log('found more than 1 ' + migrationId);
            process.exit(1);
        } else if (existingCdes.length === 0) {
            await migrationCde.save();
            created++;
        } else {
            let existingCde = existingCdes[0];
            let diff = CompareCDE.compareCde(migrationCde, existingCde);
            if (_.isEmpty(diff)) same++;
            else {
                MergeCDE.mergeCde(existingCde, migrationCde);
                await mongo_cde.updatePromise(existingCde, user);
                changed++;
            }
        }
        resolve();
    });
};

retireCde = () => {
    return new Promise(async (resolve, reject) => {
        let cond = {
            "archived": false,
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

async function run() {
    totalNinds = await NindsCdeModel.count();
    NindsCdeModel.find({}).cursor().eachAsync(ninds => {
        let nindsObj = ninds.toObject();
        return new Promise(async (resolve, reject) => {
            let nindsCde = CreateCDE.createCde(nindsObj);
            await doOne(new DataElement(nindsCde));
            ninds.remove();
            totalNinds--;
            resolve();
        })
    }).then(async () => {
        await retireCde();
        console.log('changed: ' + changed + ' created: ' + created + ' same: ' + same);
        process.exit(1);
    }, err => {
        console.log(err);
        process.exit(1);
    });
}

run().then();

setInterval(function () {
    console.log('same: ' + same + ' changed: ' + changed + ' created: ' + created + ' totalNinds: ' + totalNinds);
}, 5000);