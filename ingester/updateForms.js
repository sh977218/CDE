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
migrationConn.on('error', console.error.bind(console, 'migration connection error:'));
migrationConn.on('error', function () {
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

setInterval(function () {
    console.log(" changed: " + changed + " same: " + same + " created: " + created);
}, 10000);

var processForm = function (migrationForm, existingForm, orgName, processFormCb) {
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


var findForm = function (formId, migrationForm, source, orgName, idv, findFormDone) {
    var formCond = {
        archived: null,
        source: source,
        "registrationState.registrationStatus": {$not: /Retired/},
        imported: {$ne: importDate}
    };
    DataElement.find(formCond)
        .where("ids").elemMatch(function (elem) {
        elem.where("source").equals(source);
        elem.where("id").equals(formId);
    }).exec(function (err, existingForms) {
        if (err) throw err;
        if (existingForms.length === 0) {
            console.log('not found: ' + formId);
            //delete migrationForm._id;
            var mForm = JSON.parse(JSON.stringify(migrationForm.toObject()));
            delete mForm._id; //use mForm below!!!
            var createForm = new Form(mForm);
            createForm.imported = importDate;
            createForm.created = importDate;
            try {
                createForm.save(function (err) {
                    if (err) {
                        console.log("Unable to create Form.");
                        console.log(mForm);
                        console.log(createForm);
                        throw err;
                    }
                    else {
                        created++;
                        createdForm.push(cdeId);
                        migrationForm.remove(function (err) {
                            if (err) console.log("unable to remove: " + err);
                            else findFormDone();
                        });
                    }
                });
            } catch (e) {
                console.log(createForm);
                console.log(mForm);
                throw e;
            }
        } else if (existingForms.length > 1) {
            //console.log("Too many Forms with Id = " + formId);
            Form.find(formCond)
                .where("ids").elemMatch(function (elem) {
                elem.where("source").equals(source);
                elem.where("id").equals(formId);
                elem.where("version").equals(idv);
            }).exec(function (err, existingForms) {
                if (existingForms.length === 1) {
                    processForm(migrationForm, existingForms[0], orgName, findFormDone);
                }
                else if (existingForms.length > 1) {
                    console.log(formId);
                    console.log(source);
                    console.log(idv);
                    throw "Too many Forms with the same ID/version.";
                } else {
                    throw "Too many Form with same ID but there is a new version. Need to implement this.";
                }
            });

        } else {
            processForm(migrationForm, existingForms[0], orgName, findFormDone);
        }
    });
};
var migStream;

var streamOnData = function (migrationForm) {
    migStream.pause();
    classificationShared.sortClassification(migrationForm);
    var source = migrationForm.source;
    var orgName = migrationForm.stewardOrg.name;
    var formId = 0;
    var version;
    for (var i = 0; i < migrationForm.ids.length; i++) {
        if (migrationForm.ids[i].source === source) {
            formId = migrationForm.ids[i].id;
            version = migrationForm.ids[i].version;
        }
    }

    if (formId !== 0) {
        findForm(formId, migrationForm, source, orgName, version, function () {
            migStream.resume();
        });
    } else {
        // No Form.
        console.log("Form with no ID. !! tinyId: " + migrationForm.tinyId);
        migStream.resume();
    }
};


var streamOnClose = function () {

    // Retire Missing CDEs
    Form.where({
        imported: {$ne: importDate},
        source: cdeSource
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


var doStream = function () {
    migStream = MigrationForm.find().stream();

    migStream.on('data', streamOnData);

    migStream.on('error', function () {
        console.log("!!!!!!!!!!!!!!!!!! Unable to read from Stream !!!!!!!!!!!!!!");
    });

    migStream.on('close', streamOnClose);
};

doStream();