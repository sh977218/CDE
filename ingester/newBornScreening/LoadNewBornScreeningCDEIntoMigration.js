var async = require('async');
var MigrationNewbornScreeningCDEModel = require('./../createMigrationConnection').MigrationNewbornScreeningCDEModel;
var MigrationDataElementModel = require('./../createMigrationConnection').MigrationDataElementModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;

var orgName = 'Newborn Screening';
var org;

function run() {
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
            new MigrationOrgModel({name: orgName}).save(function (createMigrationOrgError, o) {
                if (createMigrationOrgError) throw createMigrationOrgError;
                console.log('Created migration org of ' + orgName);
                org = o;
                cb(null, 'Finished creating migration org');
            });
        },
        function (cb) {
            MigrationNewbornScreeningCDEModel.find({}).exec(function (findNewborn) {
                
            })
        }
    ], function (err, results) {
        process.exit(0);
    });
}

run();