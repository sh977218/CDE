const _ = require('lodash');
const Form = require('../../../server/form/mongo-form').Form;

const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const CreateForm = require('../Form/CreateForm');
const MergeForm = require('../Form/MergeForm');
const orgName = 'External Forms';

const loincId = '89070-7';

let today = new Date().toJSON();

async function run() {
    let loincForm = await MigrationLoincModel.findOne({loinc: loincId});
}

run().then(() => {
    process.exit(1);
}).catch(e => {
    throw e
});