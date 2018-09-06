const async = require('async');
const MigrationLoincModel = require('../../createMigrationConnection').MigrationLoincModel;

exports.runArray = function (loincIdArray, org, orgInfo, doneItem, doneAllArray) {
    let allNewCdes = [];
    async.forEachSeries(loincIdArray, function (loincId, doneOneLoinc) {
        MigrationLoincModel.findOne({loincId: loincId}, (err, loinc) => {
            if (err) throw err;
            else if (!loinc) {
                console.log('Cannot find loinc id: ' + loincId + ' in migration loinc.');
                process.exit(1);
            }
            else {
                loinc = loinc.toObject();
                let newCde = CreateCDE.createCde(loinc, orgInfo);
                ParseClassification.parseClassification(loinc, newCde, org, orgInfo['classificationOrgName'], orgInfo['classification'], function () {
                    allNewCdes.push(newCde);
                    doneItem(newCde, doneOneLoinc);
                })
            }
        })
    }, function doneAllLoincs() {
        console.log('Finished All loinc');
        doneAllArray(allNewCdes);
    })
};

exports.runOne = function (loincId, org, orgInfo) {
    return new Promise(async (resolve, reject) => {
        if (!loinc) reject("LoincId " + loincId + " not found.");
        else {
            resolve(newCde);
        }
    })
};