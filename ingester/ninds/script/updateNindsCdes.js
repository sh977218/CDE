var async = require('async'),
    _ = require('lodash'),
    mongo_cde = require('../../server/cde/mongo-cde'),
    cdediff = require('../../server/cde/cdediff'),
    classificationShared = require('@std/esm')(module)('../../shared/system/classificationShared'),
    MigrationDataElement = require('../createMigrationConnection').MigrationDataElementModel,
    DataElement = mongo_cde.DataElement,
    MigrationOrg = require('../createMigrationConnection').MigrationOrgModel,
    Org = require('../../server/system/mongo-data').Org,
    updateShare = require('../updateShare');

var importDate = new Date().toJSON();
var source = 'NINDS';
var username = 'batchloader';

function removeClassificationTree(cde, org) {
    for (var i = 0; i < cde.classification.length; i++) {
        if (cde.classification[i].stewardOrg.name === org) {
            cde.classification.splice(i, 1);
            return;
        }
    }
}

var changed = 0;
var created = 0;
var createdCDE = [];
var same = 0;
var lastEightHours = new Date();
lastEightHours.setHours(new Date().getHours() - 8);
var retired = 0;

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
    updateShare.wipeUseless(existingCde);
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
        if (existingCde.classification.length > 0) classificationShared.sortClassification(existingCde);
    } catch (e) {
        console.log(existingCde);
        throw e;
    }

    classificationShared.sortClassification(newCde);
    newCde = JSON.parse(JSON.stringify(newCde));
    updateShare.wipeUseless(newCde);

    return cdediff.diff(existingCde, newCde);
}

function processCde(migrationCde, existingCde, orgName, processCdeCb) {
    var newDe = existingCde.toObject();
    delete newDe._id;

    var deepDiff = updateShare.compareObjects(existingCde, migrationCde);
    if (!deepDiff || deepDiff.length === 0) {
        // nothing changed, remove from input
        existingCde.imported = importDate;
        existingCde.save(function (err) {
            if (err) throw "Unable to update import date";
            migrationCde.remove(function (err) {
                same++;
                if (err) throw "unable to remove";
                processCdeCb();
            });
        });
    } else if (deepDiff.length > 0) {
        updateShare.mergeNaming(migrationCde, newDe);
        updateShare.mergeSources(migrationCde, newDe);
        updateShare.mergeIds(migrationCde, newDe);
        updateShare.mergeProperties(migrationCde, newDe);
        updateShare.mergeReferenceDocument(migrationCde, newDe);
        newDe.version = migrationCde.version;
        newDe.changeNote = "Bulk update from source";
        newDe.imported = importDate;
        newDe.dataElementConcept = migrationCde.dataElementConcept;
        newDe.valueDomain = migrationCde.valueDomain;
        newDe.mappingSpecifications = migrationCde.mappingSpecifications;
        if (newDe.valueDomain.datatype === "Value List" && newDe.valueDomain && newDe.valueDomain.permissibleValues.length === 0) {
            newDe.valueDomain.datatype === newDe.valueDomain.datatypeValueList.datatype;
            delete newDe.valueDomain.datatypeValueList;
        }

        removeClassificationTree(newDe, orgName);
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
        newDe._id = existingCde._id;
        try {
            mongo_cde.update(newDe, {username: username}, function (err) {
                if (err) {
                    console.log("Cannot save CDE.");
                    console.log(newDe);
                    throw err;
                }
                else migrationCde.remove(function (err) {
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
    }
}

function findCde(cdeId, migrationCde, source, orgName, findCdeDone) {
    var cdeCond = {
        "stewardOrg.name": "NINDS",
        archived: false,
        'sources.sourceName': source,
        "registrationState.registrationStatus": {$not: /Retired/},
        imported: {$ne: importDate}
    };
    //noinspection JSUnresolvedFunction
    DataElement.find(cdeCond).where("ids").elemMatch(function (elem) {
        elem.where("source").equals(source);
        elem.where("id").equals(cdeId);
    }).exec(function (err, existingCdes) {
        if (err) throw err;
        if (existingCdes.length === 0) {
            console.log('not found: ' + cdeId);
            //delete migrationCde._id;
            var mCde = JSON.parse(JSON.stringify(migrationCde.toObject()));
            delete mCde._id; //use mCde below!!!
            mCde.imported = importDate;
            mCde.created = importDate;
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
                    mongo_cde.removeAttachmentLinks(attachment.fileid);
                    doneOneAttachment();
                }, function doneAllAttachments() {
                    existingCdes[0].attachments = migrationCde.attachments;
                    processCde(migrationCde, existingCdes[0], orgName, findCdeDone);
                })
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
    classificationShared.sortClassification(migrationCde);
    var orgName = migrationCde.stewardOrg.name;
    var cdeId = 0;
    for (var i = 0; i < migrationCde.ids.length; i++) {
        if (migrationCde.ids[i].source === source) {
            cdeId = migrationCde.ids[i].id;
        }
    }

    if (cdeId !== 0) {
        findCde(cdeId, migrationCde, source, orgName, function () {
            migStream.resume();
        });
    } else {
        // No Cde.
        console.log("CDE with no ID. !! tinyId: " + migrationCde.tinyId);
        process.exit(1);
    }
}
function streamOnClose() {
    // Retire Missing CDEs
    DataElement.find({
        'imported': {$lt: lastEightHours},
        'sources.sourceName': source,
        'classification.stewardOrg.name': 'NINDS',
        'archived': false
    }).exec(function (retiredCdeError, retireCdes) {
        if (retiredCdeError) throw retiredCdeError;
        else {
            console.log('retiredCdes: ' + retireCdes.length);
            async.forEachSeries(retireCdes, function (retireCde, doneOneRetireCde) {
                retireCde.registrationState.registrationStatus = 'Retired';
                retireCde.registrationState.administrativeNote = "Not present in import from " + importDate;
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
                                theOrg.classifications = org.classifications;
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
    });
}

function doStream() {
    migStream = MigrationDataElement.find().stream();
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