/*
 TODO
 this script does not update org
 */
var async = require('async'),
    _ = require('lodash'),
    MigrationFormModel = require('../createMigrationConnection').MigrationFormModel,
    mongo_form = require('../../modules/form/node-js/mongo-form'),
    FormModel = mongo_form.Form,
    classificationShared = require('@std/esm')(module)('../../modules/system/shared/classificationShared'),
    updateShare = require('../updateShare')
;

var importDate = new Date().toJSON();

var changed = 0;
var created = 0;
var createdForm = [];
var same = 0;
var lastEightHours = new Date();
lastEightHours.setHours(new Date().getHours() - 8);
var source = 'NINDS';
var retired = 0;
var retiredForm = [];

function processForm(migrationForm, existingForm, orgName, processFormCb) {
    // deep copy
    var newForm = existingForm.toObject();
    delete newForm._id;

    var deepDiff = updateShare.compareObjects(existingForm, migrationForm);
    if (!deepDiff || deepDiff.length === 0) {
        // nothing changed, remove from input
        existingForm.imported = new Date().toJSON();
        existingForm.markModified("imported");
        existingForm.save(function (err) {
            if (err) throw "Unable to update import date";
            migrationForm.remove(function (err) {
                same++;
                if (err) throw "unable to remove";
                processFormCb();
            });
        });
    } else if (deepDiff.length > 0) {
        updateShare.mergeNaming(migrationForm, newForm);
        updateShare.mergeSources(migrationForm, newForm);
        updateShare.mergeIds(migrationForm, newForm);
        updateShare.mergeProperties(migrationForm, newForm);
        updateShare.mergeReferenceDocument(migrationForm, newForm);
        newForm.version = migrationForm.version;
        newForm.changeNote = "Bulk update from source";
        newForm.imported = new Date().toJSON();
        newForm.formElements = migrationForm.formElements;

        updateShare.removeClassificationTree(newForm, orgName);
        if (migrationForm.classification[0]) newForm.classification.push(migrationForm.classification[0]);
        newForm._id = existingForm._id;
        try {
            newForm.updated = new Date().toJSON();
            mongo_form.update(newForm, {username: "batchloader"}, function (err) {
                if (err) {
                    console.log("Cannot save Form.");
                    console.log(newForm);
                    throw err;
                } else migrationForm.remove(function (err) {
                    if (err) throw err;
                    console.log('------------------------------\n');
                    changed++;
                    processFormCb();
                });
            });
        } catch (e) {
            console.log("newForm:\n" + newForm);
            console.log("existingForm:\n" + existingForm);
            throw e;
        }

    } else {
        console.log("Something wrong with deepDiff");
        console.log(deepDiff);
        process.exit(1);
    }
}


function doMigrationFormModel(formId, migrationForm, source, orgName, findFormDone) {
    var formCond = {
        "stewardOrg.name": "NINDS",
        "archived": false,
        "registrationState.registrationStatus": {$not: /Retired/},
        "created": {$ne: importDate}
    };
    FormModel.find(formCond).where("ids").elemMatch(function (elem) {
        elem.where("source").equals(source);
        elem.where("id").equals(formId);
    }).exec(function (err, existingForms) {
        if (err) throw err;
        if (existingForms.length === 0) {
            //delete migrationForm._id;
            var mForm = JSON.parse(JSON.stringify(migrationForm.toObject()));
            delete mForm._id; //use mForm below!!!
            var createForm = new FormModel(mForm);
            createForm.imported = importDate;
            createForm.created = importDate;
            createForm.save(function (err) {
                if (err) {
                    console.log("Unable to create Form." + mForm);
                    process.exit(1);
                }
                console.log('\n------------------------------');
                console.log('created new form with formId ' + formId);
                created++;
                createdForm.push(formId);
                migrationForm.remove(function (err) {
                    if (err) {
                        console.log("unable to remove form from migration: " + err);
                        process.exit(1);
                    }
                    console.log('removed form from migration, formId ' + formId);
                    console.log('------------------------------\n');
                    findFormDone();
                });
            });
        } else if (existingForms.length === 1) {
            console.log('\n------------------------------');
            console.log('found 1 form. processing form, tinyId ' + existingForms[0].tinyId);
            if (existingForms[0].updatedBy.username === 'lizamos') {
                console.log('updated by Liz, skip.');
                findFormDone();
            } else {
                processForm(migrationForm, existingForms[0], orgName, findFormDone);
            }
        } else {
            console.log('\n------------------------------');
            console.log('found ' + existingForms.length + ' forms. processing first form, tinyId ' + existingForms[0].tinyId);
            console.log('other forms tinyId are:');
            for (var j = 1; j < existingForms.length; j++)
                console.log(existingForms[j].tinyId);
            processForm(migrationForm, existingForms[0], orgName, findFormDone);
        }
    });
}

function streamOnClose() {
    FormModel.find({
        'imported': {$lt: lastEightHours},
        'sources.sourceName': source,
        'classification.stewardOrg.name': source,
        'updatedBy.username': {$not: /lizamos/},
        'archived': false
    }).exec(function (e, fs) {
        if (e) throw e;
        else {
            async.forEach(fs, function (f, doneOneF) {
                f.registrationState.registrationStatus = 'Retired';
                f.registrationState.administrativeNote = "Not present in import from " + new Date();
                f.save(function (error, o) {
                    if (error) throw error;
                    else {
                        retired++;
                        console.log('retired: ' + retired);
                        retiredForm.push(o.tinyId);
                        doneOneF();
                    }
                })
            }, function doneAllFs() {
                console.log('retiredForm: ' + retiredForm);
                console.log(" changed: " + changed + " same: " + same + " created: " + created);
                process.exit(1);
            })
        }
    })
}


function run() {
    var migStream = MigrationFormModel.find().stream();
    migStream.on('data', function (migrationForm) {
        migStream.pause();
        classificationShared.sortClassification(migrationForm);
        var orgName = migrationForm.stewardOrg.name;
        var formIdCounter = 0;
        var formId;
        var version;
        for (var i = 0; i < migrationForm.ids.length; i++) {
            if (migrationForm.ids[i].source === source) {
                formId = migrationForm.ids[i].id;
                version = migrationForm.ids[i].version;
                formIdCounter++;
            }
        }
        if (formIdCounter > 1) {
            console.log('found multiple ID with source ' + source + ' in formId:' + formId);
            process.exit(1);
        }

        if (formId) {
            doMigrationFormModel(formId, migrationForm, source, orgName, function () {
                migStream.resume();
            });
        } else {
            // No Form.
            console.log('Form with no ID with source ' + source + '. tinyId: ' + migrationForm.tinyId);
            process.exit(1);
        }
    });

    migStream.on('error', function () {
        console.log("!!!!!!!!!!!!!!!!!! Unable to read from Stream !!!!!!!!!!!!!!");
    });

    migStream.on('close', streamOnClose);
}

run();
setInterval(function () {
    console.log(" changed: " + changed + " same: " + same + " created: " + created);
}, 10000);
