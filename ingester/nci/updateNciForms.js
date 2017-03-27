/*
 TODO
 this script does not update org
 */
var MigrationFormModel = require('../createMigrationConnection').MigrationFormModel,
    MigrationNCIFormXmlModel = require('../createMigrationConnection').MigrationNCIFormXmlModel,
    mongo_form = require('../../modules/form/node-js/mongo-form'),
    FormModel = mongo_form.Form,
    classificationShared = require('../../modules/system/shared/classificationShared'),
    updateShare = require('../updateShare'),
    logger = require('../log')
    ;

var importDate = new Date().toJSON();

var changed = 0;
var created = 0;
var createdForm = [];
var same = 0;

var source = 'caDSR';

function output() {
    console.log(" changed: " + changed + " same: " + same + " created: " + created);
    logger.info(" changed: " + changed + " same: " + same + " created: " + created);
}

function findXml(id, version, cb) {
    MigrationNCIFormXmlModel.find({'form.publicID': id, 'form.version': version}).exec(function (err, xmls) {
        if (err) throw err;
        else {
            delete xmls[0].__v;
            cb(xmls[0]);
        }
    })
};
function processForm(migrationForm, existingForm, xml, orgName, processFormCb) {
    // deep copy
    var newForm = existingForm.toObject();
    delete newForm._id;

    var deepDiff = updateShare.compareObjects(existingForm, migrationForm);
    if (!deepDiff || deepDiff.length === 0) {
        // nothing changed, remove from input
        existingForm.imported = importDate;
        existingForm.save(function (err) {
            if (err) throw "Unable to update import date";
            migrationForm.remove(function (err) {
                same++;
                if (err) throw "unable to remove";
                processFormCb();
            });
        });
    } else if (deepDiff.length > 0) {
        newForm.naming = migrationForm.naming;
        newForm.version = migrationForm.version;
        newForm.changeNote = "Bulk update from source";
        newForm.imported = importDate;
        newForm.referenceDocuments = migrationForm.referenceDocuments;
        newForm.formElements = migrationForm.formElements;
        updateShare.removePropertiesOfSource(newForm.properties, migrationForm.source);
        newForm.properties = newForm.properties.concat(migrationForm.properties);

        updateShare.removeClassificationTree(newForm, orgName);
        if (migrationForm.classification[0]) newForm.classification.push(migrationForm.classification[0]);
        newForm._id = existingForm._id;
        newForm.attachments = [];
        try {
            mongo_form.update(newForm, {username: "batchloader"}, function (updateError, thisForm) {
                if (updateError) throw updateError;
                else {
                    updateShare.addAttachment(thisForm, xml, function () {
                        migrationForm.remove(function (err) {
                            if (err) console.log("unable to remove " + err);
                            console.log('------------------------------\n');
                            processFormCb();
                            changed++;
                        });
                    })
                }
            });
        } catch (e) {
            console.log("newForm:\n" + newForm);
            console.log("existingForm:\n" + existingForm);
            throw e;
        }

    } else {
        console.log("Something wrong with deepDiff");
        console.log(deepDiff);
    }
}


function doMigrationFormModel(migrationForm, xml, source, formId, formVersion, orgName, findFormDone) {
    var formCond = {
        archived: false,
        "registrationState.registrationStatus": {$not: /Retired/},
        created: {$ne: importDate}
    };
    FormModel.find(formCond)
        .where("ids").elemMatch(function (elem) {
        elem.where("source").equals(source);
        elem.where("id").equals(formId);
        elem.where("version").equals(formVersion);
    }).exec(function (err, existingForms) {
        if (err) throw err;
        if (existingForms.length === 0) {
            //delete migrationForm._id;
            var mForm = JSON.parse(JSON.stringify(migrationForm.toObject()));
            delete mForm._id; //use mForm below!!!
            var createForm = new FormModel(mForm);
            createForm.imported = importDate;
            createForm.created = importDate;
            createForm.save(function (err, thisForm) {
                if (err) {
                    console.log("Unable to create Form." + mForm);
                    process.exit(1);
                }
                console.log('\n------------------------------');
                console.log('created new form with formId ' + formId);
                created++;
                createdForm.push(formId);
                updateShare.addAttachment(thisForm, xml, function () {
                    migrationForm.remove(function (err) {
                        if (err) {
                            console.log("unable to remove form from migration: " + err);
                            process.exit(1);
                        }
                        console.log('removed form from migration, formId ' + formId);
                        console.log('------------------------------\n');
                        findFormDone();
                    });
                })
            });
        } else if (existingForms.length === 1) {
            console.log('\n------------------------------');
            console.log('found 1 form. processing form, tinyId ' + existingForms[0].tinyId);
            processForm(migrationForm, existingForms[0], xml, orgName, findFormDone);
        } else {
            throw "Too many CDEs with the same ID/version. id: " + formId + ' version: ' + formVersion;
            process.exit(1);
        }
    });
}

function streamOnClose() {

    // Retire Missing CDEs
    FormModel.where({
        imported: {$ne: importDate},
        'stewardOrg.name': source
    }).update({
        "registrationState.registrationStatus": "Retired",
        "registrationState.administrativeNote": "Not present in import from " + importDate
    });
    /*

     console.log("Nothing left to do, saving Org");
     MigrationOrgModel.find().exec(function (err, orgs) {
     if (err) console.log("Error Finding Migration Org " + err);
     orgs.forEach(function (org) {
     OrgModel.findOne({name: org.name}).exec(function (err, theOrg) {
     if (err)  console.log("Error finding existing org " + err);
     theOrg.classifications = org.classifications;
     theOrg.save(function (err) {
     if (err) console.log("Error saving Org " + err);
     console.log(" changed: " + changed + " same: " + same + " created: " + created);
     });
     });
     });
     });
     */

    // give 5 secs for org to save.
    setTimeout(function () {
        console.log(createdForm);
        process.exit(0);
    }, 5000);
}


function run() {
    var migStream = MigrationFormModel.find().stream();
    migStream.on('data', function (migrationForm) {
        migStream.pause();
        classificationShared.sortClassification(migrationForm);
        var orgName = migrationForm.stewardOrg.name;
        var source = migrationForm.source;
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
            findXml(formId, version, function (xml) {
                doMigrationFormModel(migrationForm, xml, source, formId, version, orgName, function () {
                    migStream.resume();
                });
            })
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