var async = require('async');
var MigrationEyeGENELoincModel = require('./../createMigrationConnection').MigrationEyeGENELoincModel;
var MigrationDataElementModel = require('./../createMigrationConnection').MigrationDataElementModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;
var orgMapping = require('../loinc/Mapping/ORG_INFO_MAP').map;

var LoadLoincCdeIntoMigration = require('../loinc/CDE/LoadLoincCdeIntoMigration');

var classificationOrgName = 'eyeGENE';
var org;

var cdeCount = 0;
var loincIdArray = [];

function run() {
    var orgInfo = orgMapping[classificationOrgName];
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
            });
        },
        function (cb) {
            new MigrationOrgModel({
                name: classificationOrgName,
                classifications: []
            }).save(function (createMigrationOrgError, o) {
                if (createMigrationOrgError) throw createMigrationOrgError;
                console.log('Created migration org of ' + classificationOrgName);
                org = o;
                cb(null, 'Finished creating migration org');
            });
        },
        function (cb) {
            MigrationEyeGENELoincModel.find({LONG_COMMON_NAME: {$regex: '^((?!panel).)*$'}}).exec(function (findCdeError, Cdes) {
                if (findCdeError) throw findCdeError;
                console.log('Total # Cde: ' + Cdes.length);
                Cdes.forEach(function (n) {
                    loincIdArray.push(n.get('LOINC_NUM'));
                });
                cb(null, 'Finished retrieving all eyeGENE cde id.');
            });
        },
        function (cb) {
            LoadLoincCdeIntoMigration.runArray(loincIdArray, org, orgInfo, function (one, next) {
                MigrationDataElementModel.find({'ids.id': one.ids[0].id}).exec(function (findMigrationDataElementError, existingCdes) {
                    if (findMigrationDataElementError) throw findMigrationDataElementError;
                    if (existingCdes.length === 0) {
                        var obj = new MigrationDataElementModel(one);
                        obj.save(function (e) {
                            if (e) throw e;
                            cdeCount++;
                            console.log('cdeCount: ' + cdeCount);
                            next();
                        });
                    } else {
                        next();
                    }
                });
            }, function () {
                org.markModified('classifications');
                org.save(function (err) {
                    if (err) throw err;
                    cb();
                });
            });
        }
    ], function () {
        process.exit(0);
    });
}

run();