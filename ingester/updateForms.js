var fs = require('fs'),
    util = require('util'),
    xml2js = require('xml2js'),
    mongoose = require('mongoose'),
    config = require('../modules/system/node-js/parseConfig'),
    form_schemas = require('../modules/form/node-js/schemas'),
    sys_schemas = require('../modules/system/node-js/schemas'),
    mongo_form = require('../modules/form/node-js/mongo-form'),
    cdesvc = require('../modules/cde/node-js/cdesvc'),
    classificationShared = require('../modules/system/shared/classificationShared'),
    updateShare = require('./updateShare')
    ;

var cdeSource = process.argv[3];

var importDate = new Date().toJSON();

var mongoUri = config.mongoUri;
var mongoMigrationUri = config.mongoMigrationUri;

var conn = mongoose.createConnection(mongoUri);
conn.on('error', console.error.bind(console, 'appData connection error:'));
conn.on('error', function () {
    process.exit(1);
});
conn.once('open', function callback() {
    console.log('mongodb connection open');
});

var migrationConn = mongoose.createConnection(mongoMigrationUri);
migrationConn.on('error', function (err) {
    console.log('migration connection error:' + err);
    process.exit(1);
});
migrationConn.once('open', function callback() {
    console.log('mongodb migration connection open');
});


var Form = conn.model('Form', form_schemas.formSchema);
var MigrationForm = migrationConn.model('Form', form_schemas.formSchema);

var Org = conn.model('Org', sys_schemas.orgSchema);
var MigrationOrg = migrationConn.model('Org', sys_schemas.orgSchema);

var changed = 0;
var created = 0;
var createdForm = [];
var same = 0;
var source = 'NINDS';

function processForm(migrationForm, existingForm, orgName, processFormCb) {
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

        for (var j = 0; j < migrationForm.properties.length; j++) {
            updateShare.removeProperty(newForm, migrationForm.properties[j]);
            newForm.properties.push(migrationForm.properties[j]);
        }

        updateShare.removeClassificationTree(newForm, orgName);
        if (migrationForm.classification[0]) newForm.classification.push(migrationForm.classification[0]);
        newForm._id = existingForm._id;
        try {
            mongo_form.update(newForm, {username: "batchloader"}, function (err) {
                if (err) {
                    console.log("Cannot save Form.");
                    console.log(newForm);
                    throw err;
                }
                else migrationForm.remove(function (err) {
                    if (err) console.log("unable to remove " + err);
                    console.log('------------------------------\n');
                    processFormCb();
                    changed++;
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
    }
};


function findForm(formId, migrationForm, source, orgName, idv, findFormDone) {
    var formCond = {
        archived: null,
        "registrationState.registrationStatus": {$not: /Retired/},
        imported: {$ne: importDate}
    };
    Form.find(formCond)
        .where("ids").elemMatch(function (elem) {
        elem.where("source").equals(source);
        elem.where("id").equals(formId);
    }).exec(function (err, existingForms) {
        if (err) throw err;
        if (existingForms.length === 0) {
            //delete migrationForm._id;
            var mForm = JSON.parse(JSON.stringify(migrationForm.toObject()));
            delete mForm._id; //use mForm below!!!
            var createForm = new Form(mForm);
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
            same++;
            console.log('\n------------------------------');
            console.log('found 1 form. processing form, tinyId ' + existingForms[0].tinyId);
            processForm(migrationForm, existingForms[0], orgName, findFormDone);
        } else {
            same++;
            console.log('\n------------------------------');
            console.log('found ' + existingForms.length + ' forms. processing first form, tinyId ' + existingForms[0].tinyId);
            console.log('other forms tinyId are:');
            for (var j = 1; j < existingForms.length; j++)
                console.log(existingForms[j].tinyId);
            processForm(migrationForm, existingForms[0], orgName, findFormDone);
        }
    });
};
function streamOnClose() {

    // Retire Missing CDEs
    Form.where({
        imported: {$ne: importDate},
        'stewardOrg.name': source
    }).update({
        "registrationState.registrationStatus": "Retired",
        "registrationState.administrativeNote": "Not present in import from " + importDate
    });

    console.log("Nothing left to do, saving Org");
    MigrationOrg.find().exec(function (err, orgs) {
        if (err) console.log("Error Finding Migration Org " + err);
        orgs.forEach(function (org) {
            Org.findOne({name: org.name}).exec(function (err, theOrg) {
                if (err)  console.log("Error finding existing org " + err);
                theOrg.classifications = org.classifications;
                theOrg.save(function (err) {
                    if (err) console.log("Error saving Org " + err);
                    console.log(" changed: " + changed + " same: " + same + " created: " + created);
                });
            });
        });
    });

    // give 5 secs for org to save.
    setTimeout(function () {
        console.log(createdForm);
        process.exit(0);
    }, 5000);
};


function run() {
    var migStream = MigrationForm.find().stream();
    migStream.on('data', function (migrationForm) {
        migStream.pause();
        classificationShared.sortClassification(migrationForm);
        var orgName = migrationForm.stewardOrg.name;
        var formIdCounter = 0;
        var formId = 0;
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

        if (formId !== 0) {
            findForm(formId, migrationForm, source, orgName, version, function () {
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
};

run();