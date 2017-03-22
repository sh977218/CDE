var async = require('async');
var MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
var MigrationOrgModel = require('../../createMigrationConnection').MigrationOrgModel;
var OrgModel = require('../../createNlmcdeConnection').OrgModel;
var mongo_form = require('../../../modules/form/node-js/mongo-form');
var FormModel = mongo_form.Form;

var orgMapping = require('../Mapping/ORG_INFO_MAP').map;
var formUlt = require('./formUlt');

var lastEightHours = new Date();
lastEightHours.setHours(new Date().getHours() - 8);

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
            var findFormCond = {orgName: orgName, isForm: true, dependentSection: false};
            MigrationLoincModel.find(findFormCond).exec(function (findFormError, loincs) {
                if (findFormError) throw findFormError;
                console.log('Processing ' + loincs.length + ' forms');
                async.forEachSeries(loincs, function (loinc, doneOneForm) {
                    if (loinc.toObject) loinc = loinc.toObject();
                    formUlt.createForm(loinc, org, orgInfo, function (newForm, formCount) {
                        formUlt.saveObj(newForm, function (o) {
                            doneOneForm();
                        });
                    })
                }, function doneAllSimpleForms() {
                    console.log('Finished creating forms');
                    org.markModified('classifications');
                    org.save(function (e) {
                        if (e) throw e;
                        console.log('Finished saving org into migration.');
                        cb();
                    })
                })
            })
        },
        function (cb) {
            OrgModel.findOne({name: orgInfo['classificationOrgName']}).exec(function (findOrgError, o) {
                if (findOrgError) throw findOrgError;
                if (orgInfo['classification'].length === 0) {
                    o.classifications = org.classifications;
                } else {
                    o.classifications.forEach(function (c) {
                        if (orgInfo['classification'].indexOf(c.name) !== -1) {
                            c.elements = org.classifications[0];
                        }
                    })
                }
                o.markModified('classifications');
                o.save(function (e) {
                    if (e) throw e;
                    console.log('Finished saving org into production.');
                    cb();
                })
            })
        },
        function (cb) {
            FormModel.find({
                'imported': {$lt: lastEightHours},
                'source': 'LOINC',
                'stewardOrg.name': orgInfo['stewardOrgName'],
                'classification.stewardOrg.name': orgInfo['stewardOrgName'],
                'classification.elements.name': orgInfo['classificationOrgName'],
                'archived': false
            }).exec(function (findRetiredFormError, retireForms) {
                if (findRetiredFormError) throw findRetiredFormError;
                console.log('There are ' + retireForms.length + ' forms need to be retired.');
                async.forEachSeries(retireForms, function (retireForm, doneOneRetireForm) {
                    retireForm.registrationState.registrationStatus = 'Retired';
                    retireForm.registrationState.administrativeNote = "Not present in import from " + today;
                    retireForm.save(function (error) {
                        if (error) throw error;
                        doneOneRetireForm();
                    })
                }, function doneAllRetireCdes() {
                    cb();
                });
            })
        }
    ], function (err, results) {
        if (next) next();
    });
};