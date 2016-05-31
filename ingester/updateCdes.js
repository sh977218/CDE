var mongo_cde = require('../modules/cde/node-js/mongo-cde'),
    cdesvc = require('../modules/cde/node-js/cdesvc'),
    classificationShared = require('../modules/system/shared/classificationShared'),
    MigrationDataElement = require('./createConnection').MigrationDataElementModel,
    DataElement = require('./createConnection').DataElementModel,
    MigrationOrg = require('./createConnection').MigrationOrgModel,
    Org = require('./createConnection').OrgModel,
    updateShare = require('./updateShare')
    ;

var cdeSource = process.argv[3];

var importDate = new Date().toJSON();

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
    for (var i = existingCde.classification.length - 1; i > 0; i--) {
        if (existingCde.classification[i].stewardOrg.name !== newCde.source) {
            existingCde.classification.splice(i, 1);
        }
    }
    if (existingCde.classification === [null]) existingCde.classification = [];
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
}

function processCde(migrationCde, existingCde, orgName, processCdeCb) {
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
                processCdeCb();
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
        newDe.ids = migrationCde.ids;
        updateShare.removePropertiesOfSource(newDe.properties, migrationCde.source);
        newDe.properties = newDe.properties.concat(migrationCde.properties);

        removeClassificationTree(newDe, orgName);
        if (migrationCde.classification[0]) {
            var indexOfClassZero = null;
            newDe.classification.forEach(function(c, i){
                if (c.stewardOrg.name === migrationCde.classification[0].stewardOrg.name) indexOfClassZero = i;
            });
            if (indexOfClassZero) newDe.classification[indexOfClassZero] = migrationCde.classification[0];
            else newDe.classification.push(migrationCde.classification[0]);
        }
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

function findCde(cdeId, migrationCde, source, orgName, idv, findCdeDone) {
    var cdeCond = {
        archived: null,
        source: source,
        "registrationState.registrationStatus": {$not: /Retired/},
        imported: {$ne: importDate}
    };
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
                        createdCDE.push(cdeId);
                        migrationCde.remove(function (err) {
                            if (err) console.log("unable to remove: " + err);
                            else findCdeDone();
                        });
                    }
                });
            } catch (e) {
                console.log(createDe);
                console.log(mCde);
                throw e;
            }
        } else if (existingCdes.length > 1) {
            //console.log("Too many CDEs with Id = " + cdeId);
            DataElement.find(cdeCond).where("ids").elemMatch(function (elem) {
                elem.where("source").equals(source);
                elem.where("id").equals(cdeId);
                elem.where("version").equals(idv);
            }).exec(function (err, existingCdes) {
                if (existingCdes.length === 1) {
                    processCde(migrationCde, existingCdes[0], orgName, findCdeDone);
                }
                else if (existingCdes.length > 1) {
                    console.log(cdeId);
                    console.log(source);
                    console.log(idv);
                    throw "Too many CDEs with the same ID/version.";
                } else {
                    throw "Too many CDEs with same ID but there is a new version. Need to implement this.";
                }
            });

        } else {
            processCde(migrationCde, existingCdes[0], orgName, findCdeDone);
        }
    });
}
var migStream;

function streamOnData(migrationCde) {
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

    if (cdeId !== 0) {
        findCde(cdeId, migrationCde, source, orgName, version, function () {
            migStream.resume();
        });
    } else {
        // No Cde.
        console.log("CDE with no ID. !! tinyId: " + migrationCde.tinyId);
        migStream.resume();
    }
}

function streamOnClose() {

    // Retire Missing CDEs
    DataElement.where({
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
                    console.log(" changed: " + changed + " same: " + same + " created: " + created);
                });
            });
        });
    });

    // give 5 secs for org to save.
    setTimeout(function () {
        console.log(" changed: " + changed + " same: " + same + " created: " + created);
        process.exit(0);
    }, 5000);
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
