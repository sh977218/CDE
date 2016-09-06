var async = require('async');
var MigrationLoincModel = require('../../../createMigrationConnection').MigrationLoincModel;
var MigrationFormModel = require('../../../createMigrationConnection').MigrationFormModel;
var MigrationOrgModel = require('../../../createMigrationConnection').MigrationOrgModel;
var CreateForm = require('./CreateForm');
var ParseClassification = require('../Shared/ParseClassification');
var ult = {};

ult.loadInnerForm = function (orgName, org) {
    async.series([
        function (cb) {
            MigrationFormModel.remove({}, function (removeMigrationFormModelError) {
                if (removeMigrationFormModelError) throw removeMigrationFormModelError;
                console.log('Removed all migration form');
                cb(null, 'Finished removing migration form');
            });
        },
        function (cb) {
            MigrationLoincModel.find({
                orgName: orgName,
                isForm: true,
                compoundForm: false
            }).exec(function (findLoincInnerFormsError, loincInnerForms) {
                if (findLoincInnerFormsError) throw findLoincInnerFormsError;
                loincInnerForms.forEachSeries(loincInnerForms, function (loincInnerForm, doneOneLoincInnerForm) {
                    if (loincInnerForm.toObject) loincInnerForm = loincInnerForm.toObject();
                    var newForm = CreateForm.create(loincInnerForm);
                    ParseClassification.parseClassification(loincInnerForm, newForm, org, function () {

                    })
                }, function () {

                })
            })
        }
    ], function (err, results) {
    });
};


exports.utl = utl;