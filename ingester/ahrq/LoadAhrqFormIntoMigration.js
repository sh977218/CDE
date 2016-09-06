var async = require('async');
var MigrationLoincModel = require('./../createMigrationConnection').MigrationLoincModel;
var MigrationFormModel = require('./../createMigrationConnection').MigrationFormModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;

var LoadLoincFormIntoMigration = require('../loinc/Format/form/LoincFormLoader');

var stewardOrgName = 'NLM';
var orgName = 'AHRQ';
var org;
var loincIdArray = [];
var formCount = 0;

function run() {
    async.series([
        function (cb) {
            LoadLoincFormIntoMigration.setStewardOrg(stewardOrgName);
            LoadLoincFormIntoMigration.setClassificationOrgName('AHRQ');
            cb(null, 'Finished set parameters');
        },
        function (cb) {
            MigrationFormModel.remove({}, function (removeMigrationFormModelError) {
                if (removeMigrationFormModelError) throw removeMigrationFormModelError;
                console.log('Removed all migration form');
                cb(null, 'Finished removing migration form');
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
            MigrationLoincModel.find({orgName:'AHRQ',isForm:true,compoundForm:false}).exec(function (findAhrqFormError, ahrqForms) {
                if (findAhrqFormError) throw findAhrqFormError;
                ahrqForms.forEach(function (n) {
                    loincIdArray.push(n.get('loincId'));
                });
                cb(null, 'Finished retrieving all newborn screening form id.');
            })
        },
        function (cb) {
            LoadLoincFormIntoMigration.runArray(loincIdArray, org, function (form, next) {
                formCount++;
                console.log('formCount: ' + formCount);
            }, function (results) {

            })

        }
    ], function (err, results) {
        process.exit(0);
    });
}

run();