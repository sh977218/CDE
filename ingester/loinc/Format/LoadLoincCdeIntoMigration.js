var async = require('async');
var MigrationLoincModel = require('./../createMigrationConnection').MigrationLoincModel;
var MigrationDataElementModel = require('./../createMigrationConnection').MigrationDataElementModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;
var MigrationLoincScaleMappingModel = require('./../createMigrationConnection').MigrationLoincScaleMappingModel;
var CreateCDE = require('./createCDE');
CreateCDE.setStewardOrg('NLM');
var ParseClassification = require('./ParseClassification');

var classificationOrgName = '';
var org;

exports.runArray = function () {

};
exports.runOne = function () {

};


function run() {
    async.series([
        function (cb) {
            MigrationDataElementModel.remove({}, function (removeMigrationDataelementError) {
                if (removeMigrationDataelementError) throw removeMigrationDataelementError;
                console.log('Removed all migration dataelement');
                cb();
            });
        },
        function (cb) {
            MigrationOrgModel.remove({}, function (removeMigrationOrgError) {
                if (removeMigrationOrgError) throw removeMigrationOrgError;
                console.log('Removed all migration org');
                cb();
            });
        },
        function (cb) {
            new MigrationOrgModel({name: classificationOrgName}).save(function (e, org) {
                if (e) throw e;
                console.log('Created migration org of ' + classificationOrgName);
                org = org;
                cb();
            });
        },
        function (cb) {
        },
        function () {
            process.exit(0);
        }
    ]);
}