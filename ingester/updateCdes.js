var fs = require('fs')
    , util = require('util')
    , xml2js = require('xml2js')
    , mongoose = require('mongoose')
    , config = require('config')
    , mongo_cde = require('../../cde/node-js/mongo-cde')
    , mongo_sys = require('../../system/node-js/mongo-data')
    , cdesvc = require('../../cde/node-js/cdesvc')
    , classificationShared = require('../../system/shared/classificationShared');

var cdeSource;
var importDate;
var MigrationDataElement;
var MigrationOrg;

var changed = 0;
var created = 0;
var same = 0;
var todo = 0;
var doneThisTime = 0;

var externalCallback;

exports.beginMigration = function(source, de, org, cb) {
    cdeSource = source;
    importDate = new Date().toJSON();
    MigrationDataElement = de;
    MigrationOrg = org;

    changed = 0;
    created = 0;
    same = 0;
    todo = 0;
    doneThisTime = 0;

    externalCallback = cb;

    doStream();
};

var DataElement = mongo_cde.DataElement;
var Org = mongo_sys.Org;

var removeProperty = function (cde, property) {
    for (var i = 0; i < cde.properties.length; i++) {
        if (property.key === cde.properties[i].key) {
            cde.properties.splice(i, 1);
            return;
        }
    }
};

var removeClassificationTree = function (cde, org) {
    for (var i = 0; i < cde.classification.length; i++) {
        if (cde.classification[i].stewardOrg.name === org) {
            cde.classification.splice(i, 1);
            return;
        }
    }
};

var checkTodo = function () {
    todo--;
    if (todo === 0) {
        console.log("nothing left to do");
        console.log(changed + " elements changed");
        console.log(created + " elements Created");
        console.log(same + " elements unchanged");
        doStream();
    }
    //MigrationDataElement.find().count(function (err, count) {
    //    if (count>0) doStream();
    //})

    DataElement.where({
        imported: {$ne: importDate},
        source: cdeSource
    }).update({
        "registrationState.registrationStatus": "Retired",
        "registrationState.administrativeNote": "Not present in import from " + importDate
    });
};

setInterval(function () {
    console.log("TODO: " + todo + " changed: " + changed + " same: " + same + " created: " + created);
}, 10000);

var wipeUseless = function (toWipeCde) {
    delete toWipeCde._id;
    delete toWipeCde.history;
    delete toWipeCde.imported;
    delete toWipeCde.created;
    delete toWipeCde.createdBy;
    delete toWipeCde.updated;
    delete toWipeCde.comments;
    delete toWipeCde.registrationState;
    delete toWipeCde.tinyId;
    delete toWipeCde.valueDomain.datatypeValueList;
};

var compareCdes = function (existingCde, newCde) {
    existingCde = JSON.parse(JSON.stringify(existingCde));
    wipeUseless(existingCde);
    for (var i = existingCde.classification.length - 1; i > 0; i--) {
        if (existingCde.classification[i].stewardOrg.name !== newCde.source) {
            existingCde.classification.splice(i, 1);
        }
    }
    if (existingCde.classification == [null]) existingCde.classification = [];
    try {
        if (existingCde.classification.length > 0) classificationShared.sortClassification(existingCde);
    } catch (e) {
        console.log(existingCde);
        throw e;
    }

    classificationShared.sortClassification(newCde);
    newCde = JSON.parse(JSON.stringify(newCde));
    wipeUseless(newCde);

    return cdesvc.diff(existingCde, newCde);
};

var processCde = function (migrationCde, existingCde, orgName) {
    // deep copy
    var newDe = existingCde.toObject();
    delete newDe._id;

    var deepDiff = compareCdes(existingCde, migrationCde);
    if (!deepDiff || deepDiff.length === 0) {
        // nothing changed, remove from input
        existingCde.imported = importDate;
        existingCde.save(function (err) {
            if (err) throw "Unable to update import date";
            migrationCde.remove(function (err) {
                same++;
                if (err) throw "unable to remove";
                checkTodo();
            });
        });
    } else if (deepDiff.length > 0) {
        newDe.naming = migrationCde.naming;
        newDe.version = migrationCde.version;
        newDe.changeNote = "Bulk update from source";
        newDe.imported = importDate;
        newDe.dataElementConcept = migrationCde.dataElementConcept;
        newDe.valueDomain = migrationCde.valueDomain;
        newDe.mappingSpecifications = migrationCde.mappingSpecifications;
        newDe.referenceDocuments = migrationCde.referenceDocuments;

        for (var j = 0; j < migrationCde.properties.length; j++) {
            removeProperty(newDe, migrationCde.properties[j]);
            newDe.properties.push(migrationCde.properties[j]);
        }

        removeClassificationTree(newDe, orgName);
        if (migrationCde.classification[0]) newDe.classification.push(migrationCde.classification[0]);
        newDe._id = existingCde._id;
        try {
            mongo_cde.update(newDe, {username: "batchloader"}, function (err) {
                if (err) {
                    console.log("Cannot save CDE.");
                    console.log(newDe);
                    throw err;
                }
                else migrationCde.remove(function (err) {
                    if (err) console.log("unable to remove " + err);
                    else checkTodo();
                    changed++;
                });
            });
        } catch (e) {
            console.log("newDe:\n" + newDe);
            console.log("existingCde:\n" + existingCde);
            throw e;
        }

    } else {
        console.log("Something wrong with deepDiff");
        console.log(deepDiff);
    }
};

var findCde = function (cdeId, migrationCde, source, orgName, idv) {
    var cdeCond = {
        archived: null,
        source: source,
        "registrationState.registrationStatus": {$not: /Retired/},
        imported: {$ne: importDate}
    };
    DataElement.find(cdeCond)
        .where("ids").elemMatch(function (elem) {
            elem.where("source").equals(source);
            elem.where("id").equals(cdeId);
        }).exec(function (err, existingCdes) {
            if (existingCdes.length === 0) {
                //delete migrationCde._id;
                var mCde = JSON.parse(JSON.stringify(migrationCde.toObject()));
                delete mCde._id; //use mCde below!!!
                var createDe = new DataElement(mCde);
                createDe.imported = importDate;
                createDe.created = importDate;
                try {
                    createDe.save(function (err) {
                        if (err) {
                            console.log("Unable to create CDE.");
                            console.log(mCde);
                            console.log(createDe);
                            throw err;
                        }
                        else {
                            created++;
                            migrationCde.remove(function (err) {
                                if (err) console.log("unable to remove: " + err);
                                else checkTodo();
                            });
                        }
                    });
                } catch (e) {
                    console.log(createDe);
                    console.log(mCde);
                    throw e;
                }
            } else if (existingCdes.length > 1) {
                console.log("Too many CDEs with Id = " + cdeId + ",  -- TODO: " + todo);

                DataElement.find(cdeCond)
                    .where("ids").elemMatch(function (elem) {
                        elem.where("source").equals(source);
                        elem.where("id").equals(cdeId);
                        elem.where("version").equals(idv);
                    }).exec(function (err, existingCdes) {
                        if (existingCdes.length === 1) {
                            processCde(migrationCde, existingCdes[0], orgName);
                        }
                        else if (existingCdes.length > 1) {
                            console.log(cdeId);
                            console.log(source);
                            console.log(idv);
                            throw "Too many CDEs with the same ID/version.";
                        } else {
                            throw "Too many CDEs with same ID but there is a new version. Need to implement this.";
                        }
                        //checkTodo(); //Multiple CDEs with the same ID but not any one with the same ID+version? This must be a new version, keep it for later!
                    });

            } else {
                processCde(migrationCde, existingCdes[0], orgName);
            }
        });
};

var streamOnData = function (migrationCde) {
    todo++;
    doneThisTime++;
    classificationShared.sortClassification(migrationCde);
    var source = migrationCde.source;
    var orgName = migrationCde.stewardOrg.name;
    var cdeId = 0;
    var idv;
    for (var i = 0; i < migrationCde.ids.length; i++) {
        if (migrationCde.ids[i].source === source) {
            cdeId = migrationCde.ids[i].id;
            idv = migrationCde.ids[i].version;
        }
    }

    if (cdeId !== 0) {
        findCde(cdeId, migrationCde, source, orgName, idv);
    } else {
        // No Cde.
        console.log("CDE with no ID. !! tinyId: " + migrationCde.tinyId);
        checkTodo();
    }
};

var streamOnClose = function () {
    console.log("End of stream");
    if (doneThisTime === 0) {
        console.log("Nothing left to do, saving Org");
        MigrationOrg.find().exec(function (err, orgs) {
            if (err) console.log("Error Finding Migration Org " + err);
            orgs.forEach(function (org) {
                Org.findOne({name: org.name}).exec(function (err, theOrg) {
                    if (err)  console.log("Error finding existing org " + err);
                    theOrg.classifications = org.classifications;
                    theOrg.save(function (err) {
                        if (err) console.log("Error saving Org " + err);
                        externalCallback();
                    });
                });
            });
        });
    }
};

var doStream = function () {
    doneThisTime = 0;
    var stream = MigrationDataElement.find().limit(200).stream();

    stream.on('data', streamOnData);

    stream.on('error', function () {
        console.log("!!!!!!!!!!!!!!!!!! Unable to read from Stream !!!!!!!!!!!!!!");
    });

    stream.on('close', streamOnClose);
};


