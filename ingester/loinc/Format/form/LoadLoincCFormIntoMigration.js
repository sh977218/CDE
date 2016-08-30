var async = require('async');
var MigrationLoincModel = require('../../../createMigrationConnection').MigrationLoincModel;
var MigrationFormModel = require('../../../createMigrationConnection').MigrationFormModel;

var CreateForm = require('./CreateForm');
var ParseClassification = require('./ParseClassification');

exports.runArray = function (loincIdArray, org, doneItem, doneAllArray) {
    var allNewForms = [];
    async.forEachSeries(loincIdArray, function (loincId, doneOneLoinc) {
        MigrationLoincModel.find({loincId: loincId}).exec(function (err, loincs) {
            if (err) throw err;
            if (loincs.length === 0) {
                console.log('Cannot find loinc id: ' + loincId + ' in migration loinc.');
                process.exit(1);
            } else if (loincs.length === 1) {
                var loinc = loincs[0].toObject();
                var newForm = CreateForm.createForm(loinc);
                ParseClassification.parseClassification(loinc, newForm, org, function () {
                    allNewForms.push(newForm);
                    MigrationFormModel.find({'ids.id': loincId}).exec(function (e, existingForms) {
                        if (e) throw e;
                        if (existingForms.length === 0) {
                            var form = CreateForm.createForm(loinc);
                            loadFormElements(loinc['PANEL HIERARCHY']['PANEL HIERARCHY'].elements, form.formElements[0].formElements, form, function () {
                                var obj = new MigrationFormModel(form);
                                obj.save(function (e) {
                                    if (e) throw e;
                                    else {
                                        doneItem(newForm, doneOneLoinc);
                                    }
                                })
                            });
                        } else {
                            doneOneLoinc()
                        }
                    });
                })
            } else {
                console.log('Found too many loinc id: ' + loincId + ' in migration loinc.');
                process.exit(1);
            }
        })
    }, function doneAllLoincs() {
        console.log('Finished All loinc');
        doneAllArray(allNewForms);
    })
};