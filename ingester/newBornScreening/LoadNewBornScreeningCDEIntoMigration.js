var async = require('async');
var MigrationNewbornScreeningCDEModel = require('./../createMigrationConnection').MigrationNewbornScreeningCDEModel;
var MigrationDataElementModel = require('./../createMigrationConnection').MigrationDataElementModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;

var LoadLoincCdeIntoMigration = require('../loinc/Format/cde/LoadLoincCdeIntoMigration');

var orgName = 'NLM';
var org;

function run() {
    async.series([
        function (cb) {
            LoadLoincCdeIntoMigration.setStewardOrg(orgName);
            LoadLoincCdeIntoMigration.setClassificationOrgName('Newborn screening');
            cb(null, 'Finished set parameters');
        },
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
            new MigrationOrgModel({name: orgName}).save(function (createMigrationOrgError, o) {
                if (createMigrationOrgError) throw createMigrationOrgError;
                console.log('Created migration org of ' + orgName);
                org = o;
                cb(null, 'Finished creating migration org');
            });
        },
        function (cb) {
            MigrationNewbornScreeningCDEModel.find({LONG_COMMON_NAME: {$regex: '^((?!panel).)*$'}}).exec(function (findNewbornScreeningCdeError, newbornScreeningCdes) {
                if (findNewbornScreeningCdeError) throw findNewbornScreeningCdeError;
                console.log('Total # Cde: ' + newbornScreeningCdes.length);
                var loincIdArray = [];
                newbornScreeningCdes.forEach(function (n) {
                    loincIdArray.push(n.get('LOINC_NUM'));
                });
                LoadLoincCdeIntoMigration.runArray(loincIdArray, org, function (one, next) {
                        MigrationDataElementModel.find({'ids.id': one.ids[0].id}).exec(function (findMigrationDataElementError, existingCdes) {
                            if (findMigrationDataElementError) throw findMigrationDataElementError;
                            if (existingCdes.length === 0) {
                                var obj = new MigrationDataElementModel(one);
                                obj.save(function (e) {
                                    if (e) throw e;
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
                    }
                )
            })
        }
    ], function (err, results) {
        process.exit(0);
    });
}

run();