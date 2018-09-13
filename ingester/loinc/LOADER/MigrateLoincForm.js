const _ = require('lodash');
const Form = require('../../../server/form/mongo-form').Form;

const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const CreateForm = require('../Form/CreateForm');
const MergeForm = require('../Form/MergeForm');
const orgName = 'External Forms';

let today = new Date().toJSON();


function loadSubForm() {
    let created = 0;
    let merged = 0;
    let same = 0;
    console.log("starting sub form");

    return new Promise(async (resolve, reject) => {
        let loincFormCond = {orgName: orgName, compoundForm: false};
        let loincForms = await MigrationLoincModel.find(loincFormCond).catch(e => {
            reject(e);
        });

        for (let loincForm of loincForms) {
            let loincId = loincForm.get('loincId');
            console.log("starting " + loincId);
            let newSubForm = await CreateForm.createForm(loincForm.toObject(), orgName).catch(e => {
                reject(e);
            });

            let formCond = {
                archived: false,
                source: 'LOINC',
                "registrationState.registrationStatus": {$not: /Retired/},
                imported: {$ne: today}
            };
            let existingForm = await Form.findOne(formCond)
                .where("ids")
                .elemMatch(function (elem) {
                    elem.where("source").equals('LOINC');
                    elem.where("id").equals(loincId);
                }).exec().catch(e => {
                    reject(e);
                });
            if (!existingForm) {
                newSubForm.imported = today;
                newSubForm.updated = today;
                newSubForm.created = today;
                await new Form(newSubForm).save().catch(e => {
                    reject(e);
                });
                console.log('created: ' + ++created);
            } else {
                let diff = MergeForm.compareForms(newSubForm, existingForm);
                if (_.isEmpty(diff)) console.log('same: ' + ++same);
                else {
                    await MergeForm.mergeForm(newSubForm, existingForm, orgName).catch(e => {
                        reject(e);
                    });
                    console.log('merged: ' + ++merged);
                }
            }
            console.log("finished " + loincId);
        }
        resolve();
    })
}

function loadCompoundForm() {

    let created = 0;
    let merged = 0;
    let same = 0;
    console.log("starting compound form");

    return new Promise(async (resolve, reject) => {
        let loincFormCond = {orgName: orgName, compoundForm: true};
        let loincForms = await MigrationLoincModel.find(loincFormCond).catch(e => {
            reject(e);
        });

        for (let loincForm of loincForms) {
            let loincId = loincForm.get('loincId');
            console.log("starting " + loincId);
            let newForm = await CreateForm.createForm(loincForm.toObject(), orgName).catch(e => {
                reject(e);
            });

            let formCond = {
                archived: false,
                source: 'LOINC',
                "registrationState.registrationStatus": {$not: /Retired/},
                imported: {$ne: today}
            };
            let existingForm = await Form.findOne(formCond)
                .where("ids")
                .elemMatch(function (elem) {
                    elem.where("source").equals('LOINC');
                    elem.where("id").equals(loincId);
                }).exec().catch(e => {
                    reject(e);
                });
            if (!existingForm) {
                newForm.imported = today;
                newForm.updated = today;
                newForm.created = today;
                await new Form(newForm).save().catch(e => {
                    reject(e);
                });
                console.log('created: ' + created++);
            } else {
                let diff = MergeForm.compareForms(newSubForm, existingForm);
                if (_.isEmpty(diff)) console.log('same: ' + same++);
                else {
                    await MergeForm.mergeForm(newSubForm, existingForm, orgName).catch(e => {
                        reject(e);
                    });
                    console.log('merged: ' + merged++);
                }
            }
            console.log("finished " + loincId);
        }
        resolve();
    })
}

// ONLY HANDLE 2 LEVEL COMPOUND FORM
async function run() {
    await loadSubForm().catch(e => {
        throw e;
    });
    await loadCompoundForm().catch(e => {
        throw e;
    });
}

run().then(() => {
    process.exit(1);
}).catch(e => {
    throw e
});