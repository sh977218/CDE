const async = require('async');
const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
const MigrationDataElementModel = require('../../createMigrationConnection').MigrationDataElementModel;
const MigrationOrgModel = require('../../createMigrationConnection').MigrationOrgModel;
const orgMapping = require('../Mapping/ORG_INFO_MAP').map;
const LoadLoincCdeIntoMigration = require('../CDE/LoadLoincCdeIntoMigration');

const orgName = 'External Forms';
let cdeCount = 0;
let loincIdArray = [];

function run() {
    let org;
    let orgInfo = orgMapping[orgName];
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
                orgName: orgName
            }).exec(function (findCdeError, Cdes) {
                if (findCdeError) throw findCdeError;
                console.log('Total # Cde: ' + Cdes.length);
                loincIdArray = Cdes.map(c => c.get('loincId'));
                cb(null, 'Finished retrieving all ' + orgName + ' cde id.');
            })
        },
        function (cb) {
            LoadLoincCdeIntoMigration.runArray(loincIdArray, org, orgInfo, function (one, next) {
                MigrationDataElementModel.find({'ids.id': one.ids[0].id}, (error, existingCdes) => {
                    if (error) throw error;
                    if (existingCdes.length === 0) {
                        one.classification = [{
                            elements: [{
                                name: "PHQ9",
                                elements: []
                            }],
                            stewardOrg: {
                                name: "NLM"
                            }
                        }
                        ];
                        new MigrationDataElementModel(one).save(function (e) {
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