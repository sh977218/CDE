var async = require("async");
var _ = require("lodash");
var moment = require("moment");

var mongo_cde = require("../../modules/cde/node-js/mongo-cde");
var classificationShared = require("../../modules/system/shared/classificationShared");
var MigrationDataElement = require("../createMigrationConnection").MigrationDataElementModel;
var DataElement = mongo_cde.DataElement;
var MigrationOrg = require("../createMigrationConnection").MigrationOrgModel;
var Org = require("../../modules/system/node-js/mongo-data").Org;
var updateShare = require("../updateShare");
var batchUser = require("../config").batchUser;

var created = 0;
var same = 0;
var retired = 0;

function compareCdes(existingCde, newCde) {
    let existingCdeCopy = _.cloneDeep(existingCde);
    let newCdeCopy = _.cloneDeep(newCde);
    updateShare.wipeUseless(existingCdeCopy);
    updateShare.wipeUseless(newCdeCopy);

    existingCdeCopy.ids.sort(function (a, b) {
        return a.source > b.source;
    });
    newCdeCopy.ids.sort(function (a, b) {
        return a.source > b.source;
    });

    existingCdeCopy.properties.sort(function (a, b) {
        return a.key > b.key;
    });
    newCdeCopy.properties.sort(function (a, b) {
        return a.key > b.key;
    });

    if (!existingCdeCopy.classification || existingCdeCopy.classification === [])
        existingCdeCopy.classification = newCdeCopy.classification;
    else existingCdeCopy.classification = _.remove(existingCdeCopy.classification, function (o) {
        return o.stewardOrg.name === "NINDS";
    });

    if (existingCdeCopy.classification.length > 0)
        classificationShared.sortClassification(existingCdeCopy);
    classificationShared.sortClassification(newCdeCopy);
    return _.isEqual(existingCdeCopy, newCdeCopy);
}

function run() {
    let orgClassification;
    async.series([
        function (cb) {
            let stream = MigrationDataElement.find().stream();
            stream.on("error", function (err) {
                throw err;
            });
            stream.on("close", cb);
            stream.on("data", function (migrationCde) {
                stream.pause();
                classificationShared.sortClassification(migrationCde);
                let idObj = _.find(migrationCde.ids, function (o) {
                    return o.source === "NINDS";
                });
                if (!idObj.id) {
                    console.log("CDE with no ID. !! tinyId: " + migrationCde.tinyId);
                    process.exit(1);
                } else {
                    let cdeId = idObj.id;
                    let findCond = {
                        "archived": false,
                        "sources.sourceName": "NINDS",
                        "registrationState.registrationStatus": {$not: /Retired/},
                        "stewardOrg.name": "NINDS",
                        "imported": {$lt: moment()}
                    };
                    DataElement.find(findCond).where("ids").elemMatch(function (elem) {
                        elem.where("source").equals("NINDS");
                        elem.where("id").equals(cdeId);
                        elem.where("version").equals(idObj.version);
                    }).exec(function (findCdeError, existingCdes) {
                        if (findCdeError) throw findCdeError;
                        if (existingCdes.length === 0) {
                            console.log("not found: " + cdeId);
                            let newCde = migrationCde.toObject();
                            delete newCde._id; //use mCde below!!!
                            newCde.imported = moment();
                            newCde.created = moment();
                            new DataElement(newCde).save(function (saveCdeError) {
                                if (saveCdeError) throw saveCdeError;
                                else migrationCde.remove(function (removeCdeError) {
                                    if (removeCdeError) throw removeCdeError;
                                    else {
                                        created++;
                                        stream.resume();
                                    }
                                });
                            });
                        } else if (existingCdes.length === 1) {
                            let existingCde = existingCdes[0];
                            if (compareCdes(existingCde, migrationCde)) {
                                delete existingCde._id;
                                existingCde.naming = migrationCde.naming;
                                existingCde.version = migrationCde.version;
                                existingCde.changeNote = "Bulk update from source";
                                existingCde.imported = moment();
                                existingCde.dataElementConcept = migrationCde.dataElementConcept;
                                existingCde.valueDomain = migrationCde.valueDomain;
                                existingCde.mappingSpecifications = migrationCde.mappingSpecifications;
                                existingCde.referenceDocuments = migrationCde.referenceDocuments;
                                existingCde.ids = migrationCde.ids;

                                existingCde.sources = migrationCde.sources.concat(_.differenceWith(existingCde.sources, migrationCde.sources, (a, b) => {
                                    return a.sourceName === b.sourceName;
                                }));

                                existingCde.properties = migrationCde.properties.concat(_.differenceWith(existingCde.properties, migrationCde.properties, (a, b) => {
                                    return a.key === b.key && a.source && b.source;
                                }));

                                existingCde.classification = migrationCde.classification.concat(_.differenceWith(existingCde.classification, migrationCde.classification, (a, b) => {
                                    return a.stewardOrg.name === b.stewardOrg.name;
                                }));

                                mongo_cde.update(existingCde, batchUser, function (updateCdeError) {
                                    if (updateCdeError) throw updateCdeError;
                                    else migrationCde.remove(function (removeCdeError) {
                                        if (err) throw removeCdeError;
                                        else {
                                            created++;
                                            stream.resume();
                                        }
                                    });
                                });
                            } else {
                                same++;
                                stream.resume();
                            }
                        } else throw "Found " + existingCdes.length + " cde with cdeId " + cdeId;
                    })
                }
            });
        },
        function (cb) {
            let retireCond = {
                "imported": {$gte: moment().add(-1, "day"), $lt: moment().add(1, "day")},
                "sources.sourceName": "NINDS",
                "classification.stewardOrg.name": "NINDS",
                "archived": false
            };
            DataElement.find(retireCond, function (retiredCdeError, retireCdes) {
                if (retiredCdeError) throw retiredCdeError;
                else {
                    async.forEachSeries(retireCdes, function (retireCde, doneOneRetireCde) {
                        retireCde.registrationState.registrationStatus = "Retired";
                        retireCde.registrationState.administrativeNote = "Not present in import from " + moment();
                        retireCde.save(function (error) {
                            if (error) throw error;
                            else {
                                retired++;
                                doneOneRetireCde();
                            }
                        })
                    }, function doneAllRetireCdes() {
                        cb();
                    });
                }
            });
        },
        function (cb) {
            MigrationOrg.find({name: "NINDS"}, function (findMigrationOrgError, migrationOrgs) {
                if (findMigrationOrgError) throw findMigrationOrgError;
                else if (migrationOrgs.length === 1) {
                    orgClassification = migrationOrgs[0].classifications;
                    cb();
                } else {
                    console.log("Found " + migrationOrgs.length + " NINDS org in migration.");
                    process.exit(1);
                }
            });
        },
        function (cb) {
            Org.find({name: "NINDS"}, function (findOrgError, orgs) {
                if (findOrgError) throw findOrgError;
                else if (orgs.length === 1) {
                    orgs[0].classifications = orgClassification;
                    orgs[0].markModified("classifications");
                    orgs[0].save(saveOrgError => {
                        if (saveOrgError)throw saveOrgError;
                        else cb();
                    });
                } else {
                    console.log("Found " + orgs.length + " NINDS org in nlmcde.");
                    process.exit(1);
                }
            });
        }], function () {
        console.log("created: " + created + " same: " + same + " retired: " + retired);
        process.exit(0);
    });
}

run();