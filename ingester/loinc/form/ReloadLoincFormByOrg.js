var async = require('async');
var MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
var MigrationFormModel = require('../../createMigrationConnection').MigrationFormModel;
var MigrationOrgModel = require('../../createMigrationConnection').MigrationOrgModel;

var formUlt = require('./formUlt');

var orgMapping={
    'AHRQ':{stwardOrgName:'NLM',classificationOrgName:'AHRQ',classification:[]},
    'eyeGENE':{stwardOrgName:'NLM',classificationOrgName:'eyeGENE',classification:[]},
    'Newborn Screening':{stwardOrgName:'NLM',classificationOrgName:'NLM',classification:['Newborn Screening']}
};


exports.reloadLoincFormsByOrg =function(orgName) {
    var org;
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
            var count = 0;
            var findSimpleFormCond= {orgName:orgName,isForm:true,compoundForm:false};
            MigrationLoincModel.find(findSimpleFormCond).exec(function (findSimpleFormError, simpleForms) {
                if (findSimpleFormError) throw findSimpleFormError;
                async.forEachSeries(simpleForms,function(simpleForm,doneOneSimpleForm){
                    if(simpleForm.toObject) simpleForm = simpleForm.toObject();
                    formUlt.createForm(simpleForm,org,orgMapping[orgName],function(newForm){
                        async.forEachSeries(simpleForm['PANEL HIERARCHY']['PANEL HIERARCHY']['elements'],function(element,doneOneElement){
                            formUlt.loadCde(element,newForm.formElements[0].formElements,doneOneElement);
                        },function doneAllElements(){
                            formUlt.saveObj(newForm,count,doneOneSimpleForm);
                        })
                    })
                },function doneAllSimpleForms(){
                    cb();
                })
            })
        }
    ], function (err, results) {
        process.exit(0);
    });
};