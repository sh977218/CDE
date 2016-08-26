var async = require('async');
var MigrationLoincModel = require('./../createMigrationConnection').MigrationLoincModel;
var MigrationNewBornScreeningCDEModel = require('./../createMigrationConnection').MigrationNewBornScreeningCDEModel;
var MigrationDataElementModel = require('./../createMigrationConnection').MigrationDataElementModel;
var MigrationOrgModel = require('./../createMigrationConnection').MigrationOrgModel;
var MigrationLoincScaleMappingModel = require('./../createMigrationConnection').MigrationLoincScaleMappingModel;

const source = "LOINC";
const stewardOrgName = 'NLM';

var cdeCounter = 0;
var newBornScreeningOrg = null;

var statusMap = {
    'Active': 'Qualified'
};

function run() {
    async.series([
        function (cb) {
            MigrationDataElementModel.remove({}, function (err) {
                if (err) throw err;
                MigrationOrgModel.remove({}, function (er) {
                    if (er) throw er;
                    new MigrationOrgModel({name: stewardOrgName, classifications: []}).save(function (e, o) {
                        if (e) throw e;
                        cb();
                    });
                });
            });
        },
        function (cb) {
            MigrationOrgModel.findOne({"name": stewardOrgName}).exec(function (error, org) {
                newBornScreeningOrg = org;
                cb();
            });
        },
        function (cb) {
            var stream = MigrationNewBornScreeningCDEModel.find({LONG_COMMON_NAME: {$regex: '^((?!panel).)*$'}}).stream();
            stream.on('data', function (newBornScreening) {
                console.log("Doing new born screening");
                stream.pause();
                if (newBornScreening.toObject) newBornScreening = newBornScreening.toObject();
                MigrationDataElementModel.find({'ids.id': newBornScreening.LOINC_NUM}, function (err, existingCdes) {
                    if (err) throw err;
                    if (existingCdes.length === 0) {
                        MigrationLoincModel.find({
                            loincId: newBornScreening.LOINC_NUM,
                            info: {$not: /^no loinc name/i}
                        }, function (er, existingLoinc) {
                            if (er) throw er;
                            if (existingLoinc.length === 0) {
                                console.log("Cannot find loinc CDE for " + newBornScreening.LOINC_NUM);
                                //TODO: How to handle this?
                                stream.resume();
                            } else {
                                var loinc = existingLoinc[0].toObject();
                                if (loinc['PARTS']) {
                                    async.forEach(loinc['PARTS']['PARTS'], function (p, doneOneP) {
                                        if (p['Part Type'] === 'Scale') {
                                            MigrationLoincScaleMappingModel.findOne({key: p['Part Name']}).exec(function (e, scaleMap) {
                                                if (e) throw e;
                                                p['Part Name'] = p['Part Name'] + ' <i>[' + scaleMap.get('Scale Type') + ']</i>';
                                                doneOneP();
                                            })
                                        } else {
                                            doneOneP();
                                        }
                                    }, function doneAllPs() {
                                        createCde(newBornScreening, loinc, function (newCde) {
                                            var newCdeObj = new MigrationDataElementModel(newCde);
                                            newCdeObj.save(function (err) {
                                                if (err) throw err;
                                                cdeCounter++;
                                                console.log('cdeCounter: ' + cdeCounter);
                                                stream.resume();
                                            });
                                        });
                                    });
                                }
                            }
                        });
                    } else {
                        throw 'Duplicated id: ' + newBornScreening.LOINC_NUM;
                    }
                });
            });

            stream.on('end', function (err) {
                console.log("End of Newborn Screening stream.");
                if (err) throw err;
                newBornScreeningOrg.markModified('classifications');
                newBornScreeningOrg.save(function (e) {
                    if (e) throw e;
                    if (cb) cb();
                    //noinspection JSUnresolvedVariable
                    process.exit(0);
                });
            });
        }]);
}

run();