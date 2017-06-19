/*
 This loader does NOT load questions in form or CDE.
 */
let async = require('async');
let _ = require('lodash');

let MigrationMeasureModel = require('../createMigrationConnection').MigrationMeasureModel;
let MigrationForm = require('../createMigrationConnection').MigrationFormModel;
let MigrationOrgModel = require('../createMigrationConnection').MigrationOrgModel;
let mongo_form = require('../../modules/form/node-js/mongo-form');
let FormModel = mongo_form.Form;
let OrgModel = require('../../modules/system/node-js/mongo-data').Org;

let updateShare = require('../updateShare');

let importDate = new Date().toJSON();
let lastEightHours = new Date();
lastEightHours.setHours(new Date().getHours() - 8);
let sameCount = 0;
let modifiedCount = 0;
let newCount = 0;
let phenxOrg;

function mergeForm(existingForm, newForm) {

    let existingClassification = existingForm.classification.filter(p => p.stewardOrg.name && p.stewardOrg.name !== "PhenX");
    existingForm.classification = newForm.classification.concat(existingClassification);

    existingForm.naming.forEach(n => {
        if (n.tags.length === 1) {
            if (n.tags[0].tag === "") {
                n.tags = [];
            }
        }
        if (!n.source) n.source = "LOINC";
    });
    let existingNaming = existingForm.naming.filter(p => !p.source || p.source !== "PhenX");
    existingForm.naming = newForm.naming.concat(existingNaming);

    let existingRefDoc = existingForm.referenceDocuments.filter(p => p.source && p.source !== "PhenX");
    existingForm.referenceDocuments = newForm.referenceDocuments.concat(existingRefDoc);

    let existingProperties = existingForm.properties.filter(p => p.source && p.source !== "PhenX");
    existingForm.properties = newForm.properties.concat(existingProperties);

    if (!existingForm.sources) existingForm.sources = [];
    let existingSources = existingForm.sources.filter(p => {
        return p.sourceName && p.sourceName !== "PhenX";
    });
    existingForm.sources = newForm.sources.concat(existingSources);
    existingForm.markModified("sources");

    let existingIds = existingForm.ids.filter(p => p.source && p.source !== "PhenX");
    existingForm.ids = newForm.ids.concat(existingIds);

    existingForm.changeNote = "Load from version 21.0";
    existingForm.updated = importDate;
    existingForm.imported = importDate;
}


function run() {
    async.series([
        function (cb) {
            FormModel.find({
                'stewardOrg.name': 'NLM',
                'classification.stewardOrg.name': 'PhenX',
                "registrationState.registrationStatus": {$not: /Retired/},
                archived: false
            }).exec(function (err, wrongStewardOrgForms) {
                if (err) throw err;
                else {
                    console.log("There are " + wrongStewardOrgForms.length + " wrong steward org phenx form need to be fixed.");
                    async.forEachSeries(wrongStewardOrgForms, (wrongStewardOrgForm, doneOneForm) => {
                        wrongStewardOrgForm.stewardOrg.name = "PhenX";
                        wrongStewardOrgForm.markModified("stewardOrg");
                        wrongStewardOrgForm.save(() => {
                            doneOneForm();
                        });
                    }, function doneAllForms() {
                        console.log("Finished fixing wrong steward org phenx forms.");
                        cb();
                    });
                }
            });
        },
        function (cb) {
            FormModel.find({
                'stewardOrg.name': 'PhenX',
                classification: {$size: 0},
                "registrationState.registrationStatus": {$not: /Retired/},
                archived: false
            }).exec(function (err, unclassifiedPhenxForms) {
                if (err) throw err;
                else {
                    console.log("There are " + unclassifiedPhenxForms.length + " unclassified phenx form need to be retired.");
                    async.forEachSeries(unclassifiedPhenxForms, (unclassifiedPhenxForm, doneOneForm) => {
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
                                newCount++;
                                console.log('newCount: ' + newCount);
                                stream.resume();
                            }
                        });
                    } else if (existingForms.length === 1) {
                        MigrationMeasureModel.find({'protocols.protocolId': formId}).exec((e, fs) => {
                            if (e) throw e;
                            else if (fs.length === 0) {
                                throw ("this form " + formId + " does not appear in the latest measure. It should have been versioned with new id.");
                            } else {
                                let existingForm = existingForms[0];
                                _.forEach(existingForm.displayProfiles, dp => {
                                    dp.displayValues = false;
                                });
                                let deepDiff = updateShare.compareObjects(existingForm, migrationForm);
                                if (deepDiff.length > 0) {
                                    mergeForm(existingForm, migrationForm);
                                    let sourcesCopy = _.cloneDeep(existingForm.get("sources"));
                                    existingForm = existingForm.toObject();
                                    mongo_form.update(existingForm, updateShare.loaderUser, (e) => {
                                        if (e) throw e;
                                        modifiedCount++;
                                        console.log("modifiedCount: " + modifiedCount);
                                        stream.resume();
                                    }, f => {
                                        f.sources = sourcesCopy;
                                    });
                                } else {
                                    existingForm.imported = importDate;
                                    existingForm.updated = importDate;
                                    existingForm.save(e => {
                                        if (e) throw e;
                                        else {
                                            sameCount++;
                                            console.log("sameCount: " + sameCount);
                                            stream.resume();
                                        }
                                    });
                                }
                            }
                        });
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
                    async.forEachSeries(fs, function (f, doneOneF) {
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
                    org.markModified("classifications");
                    org.save(e => {
                        if (e) throw e;
                        else cb();
                    });
                } else throw "Can not find PhenX org in nlm org";
            });
        }
    ], function () {
        console.log('Finished loader.');
        console.log('modifiedCount: ' + modifiedCount + ' sameCount: ' + sameCount + ' newCount: ' + newCount);
        process.exit(0);
    });
}

run();