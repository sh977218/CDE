var async = require('async');
var MigrationLoincModel = require('../../../createMigrationConnection').MigrationLoincModel;

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
                    doneItem(newForm, doneOneLoinc);
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