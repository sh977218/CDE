var async = require('async');
var MigrationLoincModel = require('./../createMigrationConnection').MigrationLoincModel;
var MigrationDataElementModel = require('./../createMigrationConnection').MigrationDataElementModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;
var orgMapping = require('../loinc/Mapping/ORG_INFO_MAP').map;

var orgName = 'AHRQ';
var cdeCount = 0;
var loincIdArray = [];

function run() {
    var org;
    var orgInfo = orgMapping[orgName];
    async.series([
        function (cb) {
            MigrationDataElementModel.remove({}, function (removeMigrationDataelementError) {
                if (removeMigrationDataelementError) throw removeMigrationDataelementError;
                console.log('Removed all migration dataelement');
                cb(null, 'Finished removing migration dataelement');
            });
        },
        function (cb) {
            MigrationOrgModel.remove({}, function (removeMigrationOrgError) {
                if (removeMigrationOrgError) throw removeMigrationOrgError;
                console.log('Removed all migration org');
                cb(null, 'Finished removing migration org');
            })
        },
        function (cb) {
            new MigrationOrgModel({
                name: orgInfo['classificationOrgName'],
                classifications: []
            }).save(function (createMigrationOrgError, o) {
                if (createMigrationOrgError) throw createMigrationOrgError;
                console.log('Created migration org of ' + orgInfo['classificationOrgName']);
                org = o;
                cb(null, 'Finished creating migration org');
            });
        },
        function (cb) {
            MigrationLoincModel.find({
                compoundForm: null,
                orgName: orgInfo['classificationOrgName']
            }).exec(function (findCdeError, Cdes) {
                if (findCdeError) throw findCdeError;
                console.log('Total # Cde: ' + Cdes.length);
                Cdes.forEach(function (n) {
                    loincIdArray.push(n.get('loincId'));
                });
                cb(null, 'Finished retrieving all ' + orgName + ' cde id.');
            })
        },
        function (cb) {
            LoadLoincCdeIntoMigration.runArray(loincIdArray, org, orgInfo, function (one, next) {
                MigrationDataElementModel.find({'ids.id': one.ids[0].id}).exec(function (findMigrationDataElementError, existingCdes) {
                    if (findMigrationDataElementError) throw findMigrationDataElementError;
                    if (existingCdes.length === 0) {
                        one.classification = [{
                            elements: [{
                                name: "Common Formats / Form",
                                elements: []
                            }],
                            stewardOrg: {
                                name: "AHRQ"
                            }
                        }
                        ];
                        var obj = new MigrationDataElementModel(one);
                        obj.save(function (e) {
                            if (e) throw e;
                            cdeCount++;
                            console.log('cdeCount: ' + cdeCount);
                            next();
                        })
                    } else {
                        next();
                    }
                });
            }, function (results) {
                org.markModified('classifications');
                org.save(function (err) {
                    if (err) throw err;
                    cb();
                })
            })
        }
    ], function (err, results) {
        process.exit(0);
    });
}

run();