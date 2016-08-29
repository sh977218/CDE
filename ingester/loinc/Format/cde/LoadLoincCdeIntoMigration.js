var async = require('async');
var MigrationLoincModel = require('../../../createMigrationConnection').MigrationLoincModel;
var CreateCDE = require('./CreateCDE');
var ParseClassification = require('./ParseClassification');

exports.setStewardOrg = function (s) {
    CreateCDE.setStewardOrg(s);
};

exports.setClassificationOrgName = function (c) {
    ParseClassification.setClassificationOrgName(c);
};

exports.runArray = function (loincIdArray, org, doneItem, doneAllArray) {
    var allNewCdes = [];
    async.forEachSeries(loincIdArray, function (loincId, doneOneLoinc) {
        MigrationLoincModel.find({loincId: loincId}).exec(function (err, loincs) {
            if (err) throw err;
            if (loincs.length === 0) {
                console.log('Cannot find loinc id: ' + loincId + ' in migration loinc.');
                process.exit(1);
            } else if (loincs.length === 1) {
                var loinc = loincs[0].toObject();
                var newCde = CreateCDE.createCde(loinc);
                ParseClassification.parseClassification(loinc, newCde, org, function () {
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
