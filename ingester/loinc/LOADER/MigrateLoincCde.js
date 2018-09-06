const DataElement = require('../../../server/cde/mongo-cde').DataElement;

const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const CreateCDE = require('../CDE/CreateCDE');
const MergeCDE = require('../CDE/MergeCDE');
const orgName = 'External Forms';

let created = 0;
let merged = 0;
let same = 0;

let today = new Date().toJSON();

async function run() {
    let cdeCond = {compoundForm: null, orgName: orgName};
    let migrationCdes = await MigrationLoincModel.find(cdeCond).catch(e => {
        throw e;
    });
    let loincIdArray = migrationCdes.map(c => c.get('loincId'));
    console.log('Total # Loinc need to be migrated: ' + loincIdArray.length);

    for (let loincId of loincIdArray) {
        console.log("starting " + loincId);
        let loinc = await MigrationLoincModel.findOne({loincId: loincId}).catch(e => {
            throw e;
        });
        if (!loinc) throw "LoincId " + loincId + " not found.";
        let newCde = await CreateCDE.createCde(loinc.toObject(), orgName);

        let cdeCond = {
            archived: false,
            source: 'LOINC',
            "registrationState.registrationStatus": {$not: /Retired/},
            imported: {$ne: today}
        };
        let existingCde = await DataElement.findOne(cdeCond)
            .where("ids")
            .elemMatch(function (elem) {
                elem.where("source").equals('LOINC');
                elem.where("id").equals(loincId);
            }).exec().catch(e => {
                throw e;
            });
        if (!existingCde) {
            newCde.imported = today;
            newCde.updated = today;
            newCde.created = today;
            await new DataElement(newCde).save().catch(e => {
                throw e;
            });
            console.log('created: ' + created++);
        } else {
            let diff = MergeCDE.compareCdes(newCde, existingCde);
            if (_.isEmpty(diff)) console.log('same: ' + same++);
            else {
                await MergeCDE.mergeCde(newCde, existingCde, orgName);
                console.log('merged: ' + merged++);
            }
        }
    }
}

run().then(() => {
    process.exit(1);
}).catch(e => {
    throw e
});