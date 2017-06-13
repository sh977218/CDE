/*
 This loader does NOT load questions in form or CDE.
 */
let async = require('async');
let _ = require('lodash');

let MigrationForm = require('../createMigrationConnection').MigrationFormModel;
let MigrationOrgModel = require('../createMigrationConnection').MigrationOrgModel;
let mongo_form = require('../../modules/form/node-js/mongo-form');
let FormModel = mongo_form.Form;
let OrgModel = require('../../modules/system/node-js/mongo-data').Org;

let updateShare = require('../updateShare');

let importDate = new Date().toJSON();
let lastEightHours = new Date();
lastEightHours.setHours(new Date().getHours() - 8);
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
            MigrationOrgModel.find({
                'stewardOrg.name': 'PhenX',
                classification: {$size: 0},
                archived: false
            }).exec(function (err, unclassifiedPhenxForms) {
                if (err) throw err;
                else {
                    console.log("There are " + unclassifiedPhenxForms.length + " unclassified phenx form need to be retired.");
                    async.forEach(unclassifiedPhenxForms, (unclassifiedPhenxForm, doneOneForm) => {
                        unclassifiedPhenxForm.registrationState.registrationStatus = "Retired";
                        unclassifiedPhenxForm.markModified("registrationState");
                        unclassifiedPhenxForm.save(() => {
                            doneOneForm();
                        });
                    }, function doneAllForms() {
                        console.log("Finished retiring unclassified phenx forms.");
                        cb();
                    });
                }
            });
        },
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
                let cond = {
                    'stewardOrg.name': 'PhenX',
                    archived: false
                };
                FormModel.find(cond).where("ids").elemMatch(function (elem) {
                    elem.where("source").equals("PhenX");
                    elem.where("id").equals(formId);
                }).exec(function (err, existingForms) {
                    if (err) throw err;
                    else if (existingForms.length === 0) {
                        let newForm = migrationForm;
                        newForm.imported = importDate;
                        newForm.created = importDate;
                        new FormModel(newForm.toObject()).save(function (err) {
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
                        if (deepDiff.length > 0) {
                            mergeForm(existingForm, migrationForm);
                            mongo_form.update(existingForm, updateShare.loaderUser, () => {
                                stream.resume();
                            });
                        } else stream.resume();
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

        },
        function (cb) {
            FormModel.find({
                'imported': {$lt: lastEightHours},
                'sources.sourceName': "PhenX",
                'classification.stewardOrg.name': "PhenX",
                'archived': false
            }).exec(function (e, fs) {
                if (e) throw e;
                else {
                    console.log("There are " + fs.length + " forms need to be retired after load");
                    async.forEach(fs, function (f, doneOneF) {
                        f.registrationState.registrationStatus = 'Retired';
                        f.registrationState.administrativeNote = "Not present in import from " + new Date();
                        f.save(error => {
                            if (error) throw error;
                            else doneOneF();
                        });
                    }, function doneAllFs() {
                        console.log("Finished retiring form.");
                        if (cb) cb();
                        else process.exit(1);
                    });
                }
            });
        },
        function (cb) {
            OrgModel.findOne({name: 'PhenX'}).exec(function (err, org) {
                if (err) throw err;
                else if (org) {
                    org.classifications = phenxOrg.classifications;
                    org.save(e => {
                        if (e) throw e;
                        else cb();
                    });
                } else throw "Can not find PhenX org in nlm org";
            });
        }
    ], function () {
        console.log('Finished loader.');
        process.exit(0);
    });
}

run();