var async = require('async');
var MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
var MigrationFormModel = require('../../createMigrationConnection').MigrationFormModel;
var MigrationOrgModel = require('../../createMigrationConnection').MigrationOrgModel;

var formUlt = require('./formUlt');

var orgMapping = {
    'AHRQ': {stewardOrgName: 'NLM', classificationOrgName: 'AHRQ', classification: []},
    'eyeGENE': {stewardOrgName: 'NLM', classificationOrgName: 'eyeGENE', classification: []},
    'Newborn Screening': {stewardOrgName: 'NLM', classificationOrgName: 'NLM', classification: ['Newborn Screening']}
};


exports.reloadLoincFormsByOrg = function (orgName, next) {
    var org;
    var orgInfo = orgMapping[orgName];
    async.series([
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

        }
    ], function (err, results) {
        if (next) next();
    });
};