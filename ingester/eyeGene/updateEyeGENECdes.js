import { BATCHLOADER } from 'ingester/shared/utility';
import { sortClassification } from 'shared/classification/classificationShared';

var async = require('async');
var mongo_cde = require('../../server/cde/mongo-cde');
var cdediff = require('../../server/cde/cdediff');
var MigrationDataElement = require('../createMigrationConnection').MigrationDataElementModel;
var DataElement = mongo_cde.DataElement;
var MigrationOrg = require('../createMigrationConnection').MigrationOrgModel;
var Org = require('../../server/system/mongo-data').Org;
var updateShare = require('../updateShare');
const adminItemSvc = require('../../server/system/adminItemSvc');

var source = 'LOINC';
var stewardOrgName = 'NLM';
var classificationOrgName = 'eyeGENE';

var today = new Date().toJSON();
var lastEightHours = new Date();
lastEightHours.setHours(new Date().getHours() - 8);
var retired = 0;

function removeClassificationTree(cde) {
    for (var i = 0; i < cde.classification.length; i++) {
        if (cde.classification[i].stewardOrg.name === classificationOrgName) {
            cde.classification.splice(i, 1);
            return;
        }
    }
}

var changed = 0;
var created = 0;
var createdCDE = [];
var same = 0;


function wipeUseless(toWipeCde) {
    delete toWipeCde._id;
    delete toWipeCde.history;
    delete toWipeCde.imported;
    delete toWipeCde.created;
    delete toWipeCde.createdBy;
    delete toWipeCde.updated;
    delete toWipeCde.updatedBy;
    delete toWipeCde.comments;
    delete toWipeCde.registrationState;
    delete toWipeCde.tinyId;
    delete toWipeCde.valueDomain.datatypeValueList;
    delete toWipeCde.classification;

    Object.keys(toWipeCde).forEach(function (key) {
        if (Array.isArray(toWipeCde[key]) && toWipeCde[key].length === 0) {
            delete toWipeCde[key];
        }
    });
}

function compareCdes(existingCde, newCde) {
    existingCde.ids.sort(function (a, b) {
        return a.source > b.source;
    });
    newCde.ids.sort(function (a, b) {
        return a.source > b.source;
    });

    existingCde.properties.sort(function (a, b) {
        return a.key > b.key;
    });
    newCde.properties.sort(function (a, b) {
        return a.key > b.key;
    });


    existingCde = JSON.parse(JSON.stringify(existingCde));
    wipeUseless(existingCde);
    /*
        if (!existingCde.classification || existingCde.classification === [])
            existingCde.classification = newCde.classification;
        else {
            for (var i = existingCde.classification.length - 1; i > 0; i--) {
                if (existingCde.classification[i].stewardOrg.name !== newCde.source) {
                    existingCde.classification.splice(i, 1);
                }
            }
        }
        try {
            if (existingCde.classification.length > 0) sortClassification(existingCde);
        } catch (e) {
            console.log(existingCde);
            throw e;
        }

        sortClassification(newCde);
    */

    newCde = JSON.parse(JSON.stringify(newCde));
    wipeUseless(newCde);

    return cdediff.diff(existingCde, newCde);
}

function processCde(migrationCde, existingCde, processCdeCb) {
    // deep copy
    var newDe = existingCde.toObject();
    delete newDe._id;

    var deepDiff = compareCdes(existingCde, migrationCde);
    if (!deepDiff || deepDiff.length === 0) {
        // nothing changed, remove from input
        existingCde.imported = today;
        existingCde.save(function (err) {
            if (err) throw "Unable to update import date";
            migrationCde.remove(function (err) {
                same++;
                if (err) throw "unable to remove";
                processCdeCb();
            });
        });
    } else if (deepDiff.length > 0) {
        newDe.naming = migrationCde.naming;
        newDe.sources = migrationCde.sources;
        newDe.version = migrationCde.version;
        newDe.changeNote = "Bulk update from source";
        newDe.imported = today;
        newDe.dataElementConcept = migrationCde.dataElementConcept;
        newDe.objectClass = migrationCde.objectClass;
        newDe.property = migrationCde.property;
        newDe.valueDomain = migrationCde.valueDomain;
        newDe.referenceDocuments = migrationCde.referenceDocuments;
        newDe.ids = migrationCde.ids;
        newDe.properties = migrationCde.properties;

        removeClassificationTree(newDe);
        /*
                if (migrationCde.classification[0]) {
                    var indexOfClassZero = null;
                    newDe.classification.forEach(function (c, i) {
                        if (c.stewardOrg.name === migrationCde.classification[0].stewardOrg.name) indexOfClassZero = i;
                    });
                    if (indexOfClassZero) newDe.classification[indexOfClassZero] = migrationCde.classification[0];
                    else {
                        newDe.classification.push(migrationCde.classification[0]);
                    }
                }
        */
        newDe._id = existingCde._id;
        try {
            mongo_cde.update(newDe, BATCHLOADER, function (err) {
                if (err) {
                    console.log("Cannot save CDE.");
                    console.log(newDe);
                    throw err;
                } else migrationCde.remove(function (err) {
                    if (err) console.log("unable to remove " + err);
                    processCdeCb();
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
}

function findCde(cdeId, migrationCde, idv, findCdeDone) {
    var cdeCond = {
        archived: false,
        source: source,
        "registrationState.registrationStatus": {$not: /Retired/},
        imported: {$ne: today}
    };
    //noinspection JSUnresolvedFunction
    DataElement.find(cdeCond).where("ids").elemMatch(function (elem) {
        elem.where("source").equals(source);
        elem.where("id").equals(cdeId);
//        elem.where("version").equals(idv);
    }).exec(function (err, existingCdes) {
        if (err) throw err;
        if (existingCdes.length === 0) {
            console.log('not found: ' + cdeId);
            //delete migrationCde._id;
            var mCde = JSON.parse(JSON.stringify(migrationCde.toObject()));
            delete mCde._id; //use mCde below!!!
            mCde.imported = today;
            mCde.updated = today;
            mCde.created = today;
            var createDe = new DataElement(mCde);
            createDe.save(function (err) {
                if (err) {
                    console.log("Unable to create CDE.");
                    console.log(mCde);
                    console.log(createDe);
                    throw err;
                } else {
                    created++;
                    createdCDE.push(cdeId);
                    migrationCde.remove(function (err) {
                        if (err) console.log("unable to remove: " + err);
                        else findCdeDone();
                    });
                }
            });
        } else if (existingCdes.length === 1) {
            if (existingCdes[0].attachments) {
                async.forEach(existingCdes[0].attachments, function (attachment, doneOneAttachment) {
                    adminItemSvc.attachmentRemove(mongo_cde, attachment.fileid, doneOneAttachment);
                }, function doneAllAttachments() {
                    existingCdes[0].attachments = migrationCde.attachments;
                    processCde(migrationCde, existingCdes[0], findCdeDone);
                });
            }
        } else {
            console.log(cdeId);
            console.log(source);
            console.log(idv);
            throw "Too many CDEs with the same ID/version.";
        }
    });
}

var migStream;

function streamOnData(migrationCde) {
    migStream.pause();
    sortClassification(migrationCde);
    var cdeId = 0;
    var version;
    for (var i = 0; i < migrationCde.ids.length; i++) {
        if (migrationCde.ids[i].source === source) {
            cdeId = migrationCde.ids[i].id;
            version = migrationCde.ids[i].version;
        }
    }

    if (cdeId !== 0) {
        findCde(cdeId, migrationCde, version, function () {
            migStream.resume();
        });
    } else {
        // No Cde.
        console.log("CDE with no ID. !! tinyId: " + migrationCde.tinyId);
        process.exit(1);
    }
}

function streamOnClose() {
    process.exit(1);
    /*
    // Retire Missing CDEs

    DataElement.find({
        'imported': {$lt: lastEightHours},
        'source': source,
        'classification.stewardOrg.name': stewardOrgName,
        'classification.elements.name': 'eyeGENE',
        'archived': false
    }).exec(function (retiredCdeError, retireCdes) {
        if (retiredCdeError) throw retiredCdeError;
        else {
            console.log('retiredCdes: ' + retireCdes.length);
            async.forEachSeries(retireCdes, function (retireCde, doneOneRetireCde) {
                retireCde.registrationState.registrationStatus = 'Retired';
                retireCde.registrationState.administrativeNote = "Not present in import from " + today;
                retireCde.save(function (error) {
                    if (error) throw error;
                    else {
                        retired++;
                        doneOneRetireCde();
                    }
                })
            }, function doneAllRetireCdes() {
                console.log("Nothing left to do, saving Org");
                MigrationOrg.find().exec(function (findMigOrgError, orgs) {
                    if (findMigOrgError) throw findMigOrgError;
                    async.forEachSeries(orgs, function (org, doneOneOrg) {
                        Org.findOne({name: org.name}).exec(function (findOrgError, theOrg) {
                            if (findOrgError) throw findOrgError;
                            else {
                                theOrg.save(function (saveOrgError) {
                                    if (saveOrgError) throw saveOrgError;
                                    else doneOneOrg();
                                });
                            }
                        });
                    }, function doneAllOrgs() {
                        //logger.info('createdCDE: ' + JSON.stringify(createdCDE));
                        console.log(" changed: " + changed + " same: " + same + " created: " + created);
                        process.exit(0);
                    });
                });
            });
        }
     });*/
}

function doStream() {
    migStream = MigrationDataElement.find().cursor();
    migStream.on('data', streamOnData);
    migStream.on('error', function () {
        console.log("!!!!!!!!!!!!!!!!!! Unable to read from Stream !!!!!!!!!!!!!!");
    });
    migStream.on('close', streamOnClose);
}

doStream();
setInterval(function () {
    console.log(" changed: " + changed + " same: " + same + " created: " + created);
}, 10000);
