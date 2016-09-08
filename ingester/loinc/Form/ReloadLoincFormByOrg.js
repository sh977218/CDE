var async = require('async');
var MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
var MigrationOrgModel = require('../../createMigrationConnection').MigrationOrgModel;

var formUlt = require('./formUlt');

var orgMapping = {
    'AHRQ': {stewardOrgName: 'NLM', classificationOrgName: 'AHRQ', classification: []},
    'eyeGENE': {stewardOrgName: 'NLM', classificationOrgName: 'eyeGENE', classification: []},
    'Newborn Screening': {stewardOrgName: 'NLM', classificationOrgName: 'NLM', classification: ['Newborn Screening']}
};

var formCount = 0;

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
//            var findFormCond = {loincId: '62300-9'};
            MigrationLoincModel.find(findFormCond).exec(function (findFormError, loincs) {
                if (findFormError) throw findFormError;
                console.log('Processing ' + loincs.length + ' forms');
                async.forEachSeries(loincs, function (loinc, doneOneForm) {
                    if (loinc.toObject) loinc = loinc.toObject();
                    formUlt.createForm(loinc, org, orgInfo, function (newForm, formCount) {
                        exports.saveObj(newForm, function (o) {
                            console.log('Finished process form : ' + o.get('ids')[0].id);
                            console.log('Form count: ' + formCount);
                            doneOneForm();
                        });
                    })
                }, function doneAllSimpleForms() {
                    console.log('Finished creating simple forms');
                    cb();
                })
            })
        }
    ], function (err, results) {
        if (next) next();
    });
};