var async = require('async'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    cdesvc = require('../../modules/cde/node-js/cdesvc'),
    classificationShared = require('../../modules/system/shared/classificationShared'),
    MigrationNCICdeXmlModel = require('../createConnection').MigrationNCICdeXmlModel,
    MigrationDataElement = require('../createConnection').MigrationDataElementModel,
    DataElement = require('../createConnection').DataElementModel,
    MigrationOrg = require('../createConnection').MigrationOrgModel,
    Org = require('../createConnection').OrgModel,
    updateShare = require('../updateShare')
    ;

var cdeSource = process.argv[3];

var changed = 0;
var created = 0;
var createdCDE = [];
var same = 0;

var today = new Date().toJSON();

function output() {
    console.log(" changed: " + changed + " same: " + same + " created: " + created);
}

function findXml(id, version, cb) {
    MigrationNCICdeXmlModel.find({'PUBLICID': id, 'VERSION': version}).exec(function (err, xmls) {
        if (err) throw err;
        else cb(xmls[0]);
    });
}

function removeClassificationTree(cde, org) {
    for (var i = 0; i < cde.classification.length; i++) {
        if (cde.classification[i].stewardOrg.name === org) {
            cde.classification.splice(i, 1);
            return;
        }
    }
}

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
    delete toWipeCde.changeNote;
    delete toWipeCde.valueDomain.datatypeValueList;
    delete toWipeCde.attachments;

    Object.keys(toWipeCde).forEach(function (key) {
        if (Array.isArray(toWipeCde[key]) && toWipeCde[key].length === 0) {
            delete toWipeCde[key];
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


    wipeUseless(existingCdeCopy);
    wipeUseless(migrationCdeCopy);

    if (!existingCdeCopy.classification || existingCdeCopy.classification === [])
        existingCdeCopy.classification = migrationCdeCopy.classification;
    else {
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

    return cdesvc.diff(existingCdeCopy, migrationCdeCopy);
}

function processCde(existingCde, migrationCde, xml, orgName, cb) {
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
        newDe.properties = updateShare.removePropertiesOfSource(newDe.properties, migrationCde.source);
        newDe.properties = newDe.properties.concat(migrationCde.properties);

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
        newDe.attachments = [];
        try {
            mongo_cde.update(newDe, {username: "batchloader"}, function (updateError, thisDe) {
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

function findCde(migrationCde, xml, orgName, cdeId, source, version, cb) {
    var cdeCond = {
        archived: null,
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
                    process.exit(1);
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
            processCde(existingCdes[0], migrationCde, xml, orgName, cb);
        } else {
            throw "Too many CDEs with the same ID/version. id: " + cdeId + ' version: ' + version;
            process.exit(1);
        }
    });
}


function run() {
    var migStream = MigrationDataElement.find().stream();
    migStream.on('data', function (migrationCde) {
        migStream.pause();
        classificationShared.sortClassification(migrationCde);
        var source = migrationCde.source;
        var orgName = migrationCde.stewardOrg.name;
        var cdeId = 0;
        var version;
        for (var i = 0; i < migrationCde.ids.length; i++) {
            if (migrationCde.ids[i].source === source) {
                cdeId = migrationCde.ids[i].id;
                version = migrationCde.ids[i].version;
            }
        }
        if (cdeId === 0) {
            // No Cde Id.
            throw ("CDE with no ID. !! tinyId: " + migrationCde.tinyId);
            process.exit(1);
        } else {
            findXml(cdeId, version, function (xml) {
                findCde(migrationCde, xml, orgName, cdeId, source, version, function () {
                    migStream.resume();
                });
            })
        }
    });
    migStream.on('error', function (streamError) {
        if (streamError) throw streamError;
    });
    migStream.on('close', function () {
        // Retire Missing CDEs
        DataElement.update({
            imported: {$ne: today},
            source: cdeSource
        }, {
            "registrationState.registrationStatus": "Retired",
            "registrationState.administrativeNote": "Not present in import from " + today
        }, function (RetiredCdeError) {
            if (RetiredCdeError) throw RetiredCdeError;
            else {
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
                        output();
                        process.exit(0);
                    });
                });
            }
        });
    });
}

run();
setInterval(output, 10000);
