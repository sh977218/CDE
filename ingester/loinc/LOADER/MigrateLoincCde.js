const _ = require('lodash');
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
    let loincCdes = await MigrationLoincModel.find(cdeCond).catch(e => {
        throw e;
    });

    for (let loincCde of loincCdes) {
        let loincId = loincCde.get('loincId');
        console.log("starting " + loincId);
        let newCde = await CreateCDE.createCde(loincCde.toObject(), orgName);

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