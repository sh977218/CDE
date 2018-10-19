const _ = require('lodash');

const mongo_cde = require('../../../server/cde/mongo-cde');
const DataElement = mongo_cde.DataElement;
const CreateCDE = require('../CDE/CreateCDE');
const MergeCDE = require('../CDE/MergeCDE');
const CompareCDE = require('../CDE/CompareCDE');
const NindsCdeModel = require('../../createMigrationConnection').NindsCdeModel;

const user = {username: 'batchloader'};

let skipCDE = [];
let changed = 0;
let created = 0;
let same = 0;
let skip = 0;
let totalNinds = 0;

replaceClassification = (existingCde, migrationCde) => {
    let classification = existingCde.toObject().classification;
    classification.forEach((c, i) => {
        if (c.stewardOrg.name === 'NINDS') {
            classification[i] = migrationCde.classification[0];
        }
    });
    existingCde.classification = classification;
};

doOne = migrationCde => {
    return new Promise(async (resolve, reject) => {
        let idObj = _.find(migrationCde.ids, o => o.source === 'NINDS');
        let migrationId = idObj.id;
        let existingCde = await DataElement.findOne({
            "archived": false,
            "registrationState.registrationStatus": {$ne: "Retired"}
        }).where("ids").elemMatch(elem => {
            elem.where("source").equals('NINDS');
            elem.where("id").equals(migrationId);
        }).exec();
        if (!existingCde) {
            await migrationCde.save();
            created++;
        } else {
            let diff = CompareCDE.compareCde(migrationCde, existingCde);
            if (_.isEmpty(diff)) {
                existingCde.imported = new Date().toJSON();
                replaceClassification(existingCde, migrationCde);
                existingCde.markModified("imported");
                await existingCde.save();
                same++;
            } else if (existingCde.updatedBy && existingCde.updatedBy.username !== 'batchloader') {
                existingCde.registrationState.administrativeNote = "Because this CDE was previously manually modified, no batch modification was applied.";
                replaceClassification(existingCde, migrationCde);
                existingCde.markModified("registrationState");
                await existingCde.save();
                skip++;
                skipCDE.push(existingCde.tinyId);
            } else {
                MergeCDE.mergeCde(existingCde, migrationCde);
                existingCde.imported = new Date().toJSON();
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
            "ids.source": 'NINDS',
            "registrationState.registrationStatus": {$ne: "Retired"},
            "imported": {$lt: new Date().setHours(new Date().getHours() - 8)},
            $and: [{"updatedBy.username": {$exists: true}},
                {"updatedBy.username": "batchloader"}]
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
        console.log(skipCDE);
        process.exit(1);
    }, err => {
        console.log(err);
        process.exit(1);
    });
}

run().then();

setInterval(function () {
    console.log('same: ' + same + ' changed: ' + changed + ' created: ' + created + ' skip: ' + skip + ' totalNinds: ' + totalNinds);
}, 5000);