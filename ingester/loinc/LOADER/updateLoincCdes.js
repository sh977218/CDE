const mongo_cde = require('../../../server/cde/mongo-cde');
const cdediff = require('../../../server/cde/cdediff');
const classificationShared = require('@std/esm')(module)('../../../shared/system/classificationShared');
const MigrationDataElement = require('../../createMigrationConnection').MigrationDataElementModel;
const DataElement = mongo_cde.DataElement;

const source = 'LOINC';
const classificationOrgName = 'NLM';

const today = new Date().toJSON();
const lastEightHours = new Date();
lastEightHours.setHours(new Date().getHours() - 8);

function removeClassificationTree(cde) {
    for (let i = 0; i < cde.classification.length; i++) {
        if (cde.classification[i].stewardOrg.name === classificationOrgName) {
            cde.classification.splice(i, 1);
            return;
        }
    }
}

let changed = 0;
let created = 0;
let createdCDE = [];
let same = 0;

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
    existingCde.ids.sort((a, b) => a.source > b.source);
    newCde.ids.sort((a, b) => a.source > b.source);

    existingCde.properties.sort((a, b) => a.key > b.key);
    newCde.properties.sort((a, b) => a.key > b.key);

    existingCde = JSON.parse(JSON.stringify(existingCde));
    wipeUseless(existingCde);
    if (!existingCde.classification || existingCde.classification === [])
        existingCde.classification = newCde.classification;
    else {
        for (let i = existingCde.classification.length - 1; i > 0; i--) {
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
    wipeUseless(newCde);

    return cdediff.diff(existingCde, newCde);
}

function processCde(migrationCde, existingCde, processCdeCb) {
    // deep copy
    let existingCdeObj = existingCde.toObject();
    let migrationCdeObj = migrationCde.toObject();

    let deepDiff = compareCdes(existingCdeObj, migrationCdeObj);
    if (deepDiff.length < 0) throw "Something wrong with deepDiff " + deepDiff;
    if (!deepDiff || deepDiff.length === 0) {
        // No changed, remove from input
        existingCde.updatedDate = today;
        existingCde.save(err => {
            if (err) throw "Unable to update import date";
            migrationCde.remove(function (err) {
                same++;
                if (err) throw "unable to remove";
                processCdeCb();
            });
        });
    } else if (deepDiff.length > 0) {
        existingCdeObj.naming = migrationCde.naming;
        existingCdeObj.sources = migrationCde.sources;
        existingCdeObj.version = migrationCde.version;
        existingCdeObj.changeNote = "Bulk update from source";
        existingCdeObj.imported = today;
        existingCdeObj.dataElementConcept = migrationCde.dataElementConcept;
        existingCdeObj.objectClass = migrationCde.objectClass;
        existingCdeObj.property = migrationCde.property;
        existingCdeObj.valueDomain = migrationCde.valueDomain;
        existingCdeObj.mappingSpecifications = migrationCde.mappingSpecifications;
        existingCdeObj.referenceDocuments = migrationCde.referenceDocuments;
        existingCdeObj.ids = migrationCde.ids;
        existingCdeObj.properties = migrationCde.properties;

        removeClassificationTree(existingCdeObj);
        if (migrationCde.classification[0]) {
            let indexOfClassZero = null;
            existingCdeObj.classification.forEach(function (c, i) {
                if (c.stewardOrg.name === migrationCde.classification[0].stewardOrg.name) indexOfClassZero = i;
            });
            if (indexOfClassZero) existingCdeObj.classification[indexOfClassZero] = migrationCde.classification[0];
            else {
                existingCdeObj.classification.push(migrationCde.classification[0]);
            }
        }
        existingCdeObj._id = existingCde._id;
        mongo_cde.update(existingCdeObj, {username: "batchloader"}, err => {
            if (err) throw err;
            else migrationCde.remove(err => {
                if (err) throw err;
                else {
                    processCdeCb();
                    changed++;
                }
            });
        });
    }
}

MigrationDataElement.find({}).cursor().eachAsync(migrationCde => {
    return new Promise((resolve, reject) => {
        classificationShared.sortClassification(migrationCde);
        let desireId = migrationCde.ids.filter(id => id.source === source);
        let cdeId = desireId[0].id;
        let cdeVersion = desireId[0].version;

        let cdeCond = {
            archived: false,
            source: 'LOINC',
            "registrationState.registrationStatus": {$not: /Retired/},
            imported: {$ne: today}
        };
        DataElement.find(cdeCond).where("ids").elemMatch(function (elem) {
            elem.where("source").equals(source);
            elem.where("id").equals(cdeId);
        }).exec((err, existingCdes) => {
            if (err) throw err;
            if (existingCdes.length > 1) throw existingCdes.length + " CDEs with the same ID: " + cdeId + " version: " + cdeVersion;
            if (existingCdes.length === 0) {
                let mCde = migrationCde.toObject();
                mCde.imported = today;
                mCde.updated = today;
                mCde.created = today;
                new DataElement(mCde).save(err => {
                    if (err) throw err;
                    else {
                        created++;
                        createdCDE.push(cdeId);
                        migrationCde.remove(err => {
                            if (err) throw err;
                            resolve();
                        });
                    }
                });
            } else if (existingCdes.length === 1) {
                processCde(migrationCde, existingCdes[0], resolve);
            }
        });

    })
}).then(() => {
    /*    // Retire Missing CDEs
        DataElement.find({
            'imported': {$lt: lastEightHours},
            'source': 'AHRQ',
            'archived': false,
            'stewardOrg.name': 'AHRQ'
        }, (retiredCdeError, retireCdes) => {
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
    */
});
