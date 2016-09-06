var async = require('async');
var MigrationLoincModel = require('../../../createMigrationConnection').MigrationLoincModel;
var MigrationFormModel = require('../../../createMigrationConnection').MigrationFormModel;

var ult = require('./formUlt');
var ParseClassification = require('.././ParseClassification');
var ParseFormElement = require('./ParseFormElement');

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
                ult.createForm(loinc, org, 'NLM', 'AHRQ', [], function (newForm) {
                    allNewForms.push(newForm);
                    MigrationFormModel.find({'ids.id': loincId}).exec(function (e, existingForms) {
                        if (e) throw e;
                        if (existingForms.length === 0) {
                            var form = ult.createForm(loinc, 'NLM', 'AHRQ');
                            ParseFormElement.parseFormElement(loinc['PANEL HIERARCHY']['PANEL HIERARCHY'].elements, form.formElements[0].formElements, function () {
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
                });
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