var async = require('async');
var MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;
var CreateCDE = require('./CreateCDE');
var ParseClassification = require('../Shared/ParseClassification');

exports.runArray = function (loincIdArray, org, orgInfo, doneItem, doneAllArray) {
    var allNewCdes = [];
    async.forEachSeries(loincIdArray, function (loincId, doneOneLoinc) {
        MigrationLoincModel.find({loincId: loincId}).exec(function (err, loincs) {
            if (err) throw err;
            if (loincs.length === 0) {
                console.log('Cannot find loinc id: ' + loincId + ' in migration loinc.');
                process.exit(1);
            } else if (loincs.length === 1) {
                var loinc = loincs[0].toObject();
                var newCde = CreateCDE.createCde(loinc, orgInfo);
                ParseClassification.parseClassification(loinc, newCde, org, orgInfo['classificationOrgName'], orgInfo['classification'], function () {
                    allNewCdes.push(newCde);
                    doneItem(newCde, doneOneLoinc);
                })
            } else {
                console.log('Found too many loinc id: ' + loincId + ' in migration loinc.');
                process.exit(1);
            }
        })
    }, function doneAllLoincs() {
        console.log('Finished All loinc');
        doneAllArray(allNewCdes);
    })
};
