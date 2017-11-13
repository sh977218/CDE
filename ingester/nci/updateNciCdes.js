// npm module
var async = require('async');

// mongoose schema
var MigrationNCICdeXmlModel = require('../createMigrationConnection').MigrationNCICdeXmlModel;
var MigrationDataElement = require('../createMigrationConnection').MigrationDataElementModel;

var MigrationOrg = require('../createMigrationConnection').MigrationOrgModel;

var mongo_cde = require('../../modules/cde/node-js/mongo-cde');
var DataElement = mongo_cde.DataElement;
var Org = require('../../modules/system/node-js/mongo-data').Org;
var cdesvc = require('../../modules/cde/node-js/cdediff');
var classificationShared = require('@std/esm')(module)('../../modules/system/shared/classificationShared');
var updateShare = require('../updateShare');
var logger = require('../log');


var cdeSource = 'caDSR';

var changed = 0;
var created = 0;
var same = 0;

var createdCDE = [];
var retired = 0;

var today = new Date().toJSON();
var lastEightHours = new Date();
lastEightHours.setHours(new Date().getHours() - 8);


function output() {
    console.log(" changed: " + changed + " same: " + same + " created: " + created + " retired: " + retired);
    logger.info(" changed: " + changed + " same: " + same + " created: " + created + " retired: " + retired);
}

function findXml(id, version, cb) {
    MigrationNCICdeXmlModel.find({'PUBLICID': id, 'VERSION': version}).exec(function (err, xmls) {
        if (err) throw err;
        else {
            delete xmls[0].__v;
            cb(xmls[0]);
        }
    });
}

function compareCdes(existingCde, migrationCde) {
    var existingCdeCopy = JSON.parse(JSON.stringify(existingCde));
    var migrationCdeCopy = JSON.parse(JSON.stringify(migrationCde));

    existingCdeCopy.naming.sort(function (a, b) {
        return a.designation > b.designation;
    });
    migrationCdeCopy.naming.sort(function (a, b) {
        return a.designation > b.designation;
    });

    existingCdeCopy.ids.sort(function (a, b) {
        return a.source > b.source;
    });
    migrationCdeCopy.ids.sort(function (a, b) {
        return a.source > b.source;
    });

    existingCdeCopy.properties.sort(function (a, b) {
        return a.key > b.key;
    });
    migrationCdeCopy.properties.sort(function (a, b) {
        return a.key > b.key;
    });

    existingCdeCopy.referenceDocuments.sort(function (a, b) {
        return a.title > b.title;
    });
    migrationCdeCopy.referenceDocuments.sort(function (a, b) {
        return a.title > b.title;
    });


    updateShare.wipeUseless(existingCdeCopy);
    updateShare.wipeUseless(migrationCdeCopy);

    if (!existingCdeCopy.classification) {
        existingCdeCopy.classification = [];
    } else {
        for (var i = existingCdeCopy.classification.length - 1; i > 0; i--) {
            if (existingCdeCopy.classification[i].stewardOrg.name !== migrationCdeCopy.source) {
                existingCdeCopy.classification.splice(i, 1);
            }
        }
    }
    try {
        if (existingCdeCopy.classification.length > 0) classificationShared.sortClassification(existingCdeCopy);
    } catch (e) {
        throw e;
    }

    classificationShared.sortClassification(migrationCdeCopy);
    var dif = cdesvc.diff(existingCdeCopy, migrationCdeCopy);
    return dif;
}

function processCde(existingCde, migrationCde, xml, cb) {
    var deepDiff = compareCdes(existingCde, migrationCde);
    if (!deepDiff || deepDiff.length === 0) {
        // nothing changed, remove from input
        existingCde.imported = today;
        existingCde.save(function (saveExistingCdeError) {
            if (saveExistingCdeError) throw "Unable to update import date";
            migrationCde.remove(function (removeMigrationCdeError) {
                if (removeMigrationCdeError) throw "unable to remove";
                same++;
                cb();
            });
        });
    } else if (deepDiff.length > 0) {
        var newDe = existingCde.toObject();
        newDe.naming = migrationCde.naming;
        newDe.version = migrationCde.version;
        newDe.changeNote = "Bulk update from source";
        newDe.imported = today;
        newDe.dataElementConcept = migrationCde.dataElementConcept;
        newDe.valueDomain = migrationCde.valueDomain;
        newDe.mappingSpecifications = migrationCde.mappingSpecifications;
        newDe.referenceDocuments = migrationCde.referenceDocuments;
        newDe.ids = migrationCde.ids;
        updateShare.mergeSources(newDe.sources, migrationCde.sources);
        newDe.properties = migrationCde.properties;
        newDe.registrationState = migrationCde.registrationState;

        updateShare.removeClassificationTree(newDe, migrationCde.classification[0].stewardOrg.name);
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
        newDe.attachments = [];
        try {
            mongo_cde.update(newDe, {username: "batchLoader"}, function (updateError, thisDe) {
                if (updateError) throw updateError;
                else {
                    updateShare.addAttachment(thisDe, xml, function () {
                        migrationCde.remove(function (removeMigrationError) {
                            if (removeMigrationError) throw removeMigrationError;
                            else {
                                changed++;
                                cb();
                            }
                        });
                    });
                }
            });
        } catch (e) {
            throw e;
        }

    } else {
        console.log("Something wrong with deepDiff");
        console.log(deepDiff);
    }
}

function findCde(migrationCde, xml, source, cdeId, version, cb) {
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
        elem.where("version").equals(version);
    }).exec(function (err, existingCdes) {
        if (err) throw err;
        if (existingCdes.length === 0) {
            console.log('not found id: ' + cdeId + ' version: ' + version);
            //delete migrationCde._id;
            var newCde = JSON.parse(JSON.stringify(migrationCde.toObject()));
            delete newCde._id; //use mCde below!!!
            newCde.imported = today;
            newCde.created = today;
            var newCdeObj = new DataElement(newCde);
            newCdeObj.save(function (saveNewCdeError, thisDe) {
                if (saveNewCdeError) {
                    console.log("Unable to create CDE. id: " + cdeId + ' version: ' + version);
                    throw saveNewCdeError;
                } else {
                    created++;
                    createdCDE.push({id: cdeId, version: version});
                    migrationCde.remove(function (removeMigrationCdeError) {
                        if (removeMigrationCdeError) throw removeMigrationCdeError;
                        else {
                            updateShare.addAttachment(thisDe, xml, function () {
                                cb();
                            });
                        }
                    });
                }
            });
        } else if (existingCdes.length === 1) {
            processCde(existingCdes[0], migrationCde, xml, cb);
        } else {
            throw "Too many CDEs with the same ID/version. id: " + cdeId + ' version: ' + version;
        }
    });
}


function run() {
    var migStream = MigrationDataElement.find().stream();
    migStream.on('data', function (migrationCde) {
        migStream.pause();
        classificationShared.sortClassification(migrationCde);
        var foundIdVersion = updateShare.findEltIdVersion(migrationCde, cdeSource);
        if (foundIdVersion.length == 0) {
            // No Cde Ids.
            throw ("CDE with no ID. !! tinyId: " + migrationCde.tinyId);
        } else if (foundIdVersion.length === 1) {
            var cdeId = foundIdVersion[0].id;
            var cdeVersion = foundIdVersion[0].version;
            findXml(cdeId, cdeVersion, function (xml) {
                findCde(migrationCde, xml, cdeSource, cdeId, cdeVersion, function () {
                    migStream.resume();
                });
            })
        }
        else {
            // too many Ids
            throw ('Multiple id and version found. ' + foundIdVersion);
        }
    });
    migStream.on('error', function (streamError) {
        if (streamError) throw streamError;
    });
    migStream.on('close', function () {
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
                logger.info('createdCDE: ' + JSON.stringify(createdCDE));
                output();
                process.exit(0);
            });
        });
    });
}

run();
setInterval(output, 10000);
