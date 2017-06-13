/*
 This loader does NOT load questions in form or CDE.
 */
let async = require('async');
let _ = require('lodash');

let MigrationForm = require('../createMigrationConnection').MigrationFormModel;
let MigrationOrgModel = require('../createMigrationConnection').MigrationOrgModel;
let FormModel = require('../../modules/form/node-js/mongo-form').Form;

let updateShare = require('../updateShare');

let importDate = new Date().toJSON();
let count = 0;
let phenxOrg;

function mergeForm(existingForm, newForm) {
    updateShare.mergeNaming(existingForm, newForm);
    updateShare.mergeReferenceDocument(existingForm, newForm);
    updateShare.mergeIds(existingForm, newForm);
    updateShare.mergeProperties(existingForm, newForm);
    updateShare.mergeSources(existingForm, newForm);
    updateShare.mergeClassification(existingForm, newForm);

    existingForm.updateDate = importDate;
}


function run() {
    async.series([
        function (cb) {
            MigrationOrgModel.findOne({name: 'PhenX'}).exec(function (err, org) {
                if (err) throw err;
                else if (org) {
                    phenxOrg = org;
                    cb();
                } else throw "Can not find PhenX org in migration org";
            });
        },
        function (cb) {
            let stream = MigrationForm.find({}).stream();
            stream.on('data', function (migrationForm) {
                stream.pause();
                let formId = migrationForm.ids[0].id;
                FormModel.find({}).where("ids").elemMatch(function (elem) {
                    elem.where("source").equals("PhenX");
                    elem.where("id").equals(formId);
                }).exec(function (err, existingForms) {
                    if (err) throw err;
                    else if (existingForms.length === 0) {
                        let newForm = migrationForm;
                        newForm.imported = importDate;
                        newForm.created = importDate;
                        new FormModel(newForm).save(function (err) {
                            if (err) throw err;
                            else {
                                count++;
                                console.log('count: ' + count);
                                stream.resume();
                            }
                        });
                    } else if (existingForms.length === 1) {
                        let existingForm = existingForms[0];
                        _.forEach(existingForm.displayProfiles, dp => {
                            dp.displayValues = false;
                        });
                        let deepDiff = updateShare.compareObjects(existingForm, migrationForm);
                        if (deepDiff.length > 0)
                            mergeForm(existingForm, migrationForm, () => {
                                stream.resume();
                            });
                        else stream.resume();
                    } else {
                        console.log(existingForms.length + ' forms found, formId: ' + formId);
                        process.exit(1);
                    }
                });
            });
            stream.on('end', function (err) {
                if (err) throw err;
                if (cb) cb();
            });

        }], function () {
        console.log('Finished.');
        process.exit(0);
    });
}

run();