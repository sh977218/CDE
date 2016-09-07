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


exports.reloadLoincFormsByOrg = function (orgName) {
    var org;
    var orgInfo = orgMapping[orgName];
    async.series([
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
            var findSimpleFormCond = {orgName: orgName, isForm: true, compoundForm: false, dependentSection: false};
            MigrationLoincModel.find(findSimpleFormCond).exec(function (findSimpleFormError, simpleForms) {
                if (findSimpleFormError) throw findSimpleFormError;
                console.log('Processing ' + simpleForms.length + ' simple forms');
                async.forEachSeries(simpleForms, function (simpleForm, doneOneSimpleForm) {
                    if (simpleForm.toObject) simpleForm = simpleForm.toObject();
                    formUlt.createForm(simpleForm, org, orgInfo, function (newForm) {
                        async.forEachSeries(simpleForm['PANEL HIERARCHY']['PANEL HIERARCHY']['elements'], function (element, doneOneElement) {
                            formUlt.loadCde(element, newForm.formElements[0].formElements, doneOneElement);
                        }, function doneAllElements() {
                            formUlt.saveObj(newForm, function () {
                                doneOneSimpleForm();
                            });
                        })
                    })
                }, function doneAllSimpleForms() {
                    console.log('Finished creating simple forms');
                    cb();
                })
            })
        },
        function (cb) {
            formUlt.updateFormByOrgName(orgName,org,function(){
                cb();
            });
        },
        function(cb){
            var findCompoundFormCond = {orgName: orgName, isForm: true, compoundForm: true};
            MigrationLoincModel.find(findCompoundFormCond).exec(function (findCompoundFormError, compoundForms) {
                if (findCompoundFormError) throw findCompoundFormError;
                console.log('Processing ' + compoundForms.length + ' compound forms');
                async.forEachSeries(compoundForms, function (compoundForm, doneOneCompoundForm) {
                    if (compoundForm.toObject) compoundForm = compoundForm.toObject();
                    formUlt.createForm(compoundForm, org, orgInfo, function (newForm) {
                        async.forEachSeries(compoundForm['PANEL HIERARCHY']['PANEL HIERARCHY']['elements'], function (element, doneOneElement) {
                            if(element.elements.length===0) {
                                formUlt.loadCde(element, newForm.formElements[0].formElements, doneOneElement);
                            }else if(element.elements.length !== 0 && element){
                                formUlt.loadForm(element,newForm.formElements[0].formElements,doneOneElement);
                            }
                        }, function doneAllElements() {
                            formUlt.saveObj(newForm, function () {
                                doneOneCompoundForm();
                            });
                        })
                    })
                }, function doneAllCompoundForms() {
                    console.log('Finished creating compound forms');
                    cb();
                })
            })
        },
        function (cb) {
            formUlt.updateFormByOrgName(orgName,org,function(){
                cb();
            });
        }
    ], function (err, results) {
    });
};