var mongoose = require('mongoose'),
    fs = require('fs'),
    config = require('../../modules/system/node-js/parseConfig'),
    async = require('async'),
    schemas = require('../../modules/cde/node-js/schemas'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde')
    ;

var mongoMigrationUri = config.mongoMigrationUri;
var mongoUri = config.mongoUri;
var migrationConn = mongoose.createConnection(mongoMigrationUri);
var mongoConn = mongoose.createConnection(mongoUri);
migrationConn.once('open', function callback() {
    console.log('mongodb ' + config.database.migration.db + ' connection open');
});
mongoConn.once('open', function callback() {
    console.log('mongodb ' + config.database.appData.db + ' connection open');
});

var DataElement = mongoConn.model('DataElement', schemas.dataElementSchema);
var PhenxModel = migrationConn.model('Phenx', new mongoose.Schema({}, {strict: false, collection: 'phenx'}));
var LoincModel = migrationConn.model('Loinc', new mongoose.Schema({}, {strict: false, collection: 'loinc'}));
var PhenxInLoincModel = migrationConn.model('PhenxInLoinc', new mongoose.Schema({}, {
    strict: false,
    collection: 'phenxInLoinc'
}));
var PhenxNotInLoincModel = migrationConn.model('PhenxNotInLoinc', new mongoose.Schema({}, {
    strict: false,
    collection: 'phenxNotInLoinc'
}));
var MappingModel = migrationConn.model('Mapping', new mongoose.Schema({}, {
    strict: false,
    collection: 'mapping'
}));
var PhenxInLoincInDbGapModel = migrationConn.model('PhenxInLoincInDbGap', new mongoose.Schema({}, {
    strict: false,
    collection: 'phenxInLoincInDbGap'
}));
var PhenxInLoincNotInDbGapModel = migrationConn.model('PhenxInLoincNotInDbGap', new mongoose.Schema({}, {
    strict: false,
    collection: 'phenxInLoincNotInDbGap'
}));

var user = {username: 'batchloader'};
var phenxCounter = 0;
var phenxInLoinc = [];
var phenxNotInLoinc = [];
var phenxInLoincInDbGap = [];
var phenxInLoincNotInDbGap = [];

var dbGapUrlPre = 'https://www.phenxtoolkit.org/index.php?pageLink=browse.gapmapping&vname=';
var dbGapUrlPost = '&vid=';

function init(taskNum) {
    async.series([
        function (cb) {
            if (taskNum === 1) {
                var stream = PhenxModel.find().stream();
                stream.on('data', function (phenx) {
                    phenxCounter++;
                    stream.pause();
                    var variableSrc = phenx.get('VARIABLE_SOURCE');
                    var variableId = phenx.get('VARIABLE_TERM');
                    LoincModel.find({
                        'SOURCE': variableSrc,
                        'SURVEY_QUEST_SRC': variableId.replace('PX', 'PhenX.')
                    }, function (err, data) {
                        if (err) throw err;
                        if (data && data.length > 0) {
                            if (data && data.length > 1) {
                                console.log('return duplicated loinc for ' + variableId);
                            }
                            phenxInLoinc.push({phenx: phenx, loinc: data});
                        }
                        else {
                            phenxNotInLoinc.push(phenx);
                        }
                        stream.resume();
                    })
                });
                stream.on('end', function () {
                    console.log('finished all phenx.');
                    console.log('found ' + phenxInLoinc.length + ' in loinc.');
                    var obj1 = new PhenxInLoincModel({phenxInLoinc: phenxInLoinc});
                    obj1.save(function () {
                        console.log('phenxInLoinc saved.');
                        var obj2 = new PhenxNotInLoincModel({phenxNotInLoinc: phenxNotInLoinc});
                        obj2.save(function () {
                            console.log('phenxNotInLoinc saved.');
                            cb();
                        });
                    });
                });
            } else {
                cb();
            }
        },
        function (cb) {
            if (taskNum === 2) {
                var stream = PhenxInLoincModel.findOne({}).stream();
                stream.on('data', function (data) {
                    stream.pause();
                    var phenxInLoincArray = data.get('phenxInLoinc');
                    async.forEachSeries(phenxInLoincArray, function (one, doneOne) {
                        var phenx = one.phenx;
                        var loinc = one.loinc[0];
                        var loincId = loinc.LOINC_NUM;
                        mongo_cde.query({'archived': null, 'ids.id': loincId}, function (err, deArr) {
                            if (err) throw err;
                            if (!deArr || !deArr[0]) {
                                console.log(loincId);
                                console.log(loinc);
                            }
                            var de = deArr[0].toObject();
                            MappingModel.findOne({'VARIABLE_NAME': phenx.VARNAME}).exec(function (err, m) {
                                if (err) throw err;
                                if (m) {
                                    var uri = dbGapUrlPre + m.get('VARIABLE_NAME') + dbGapUrlPost + m.get('VARIABLE_ID');
                                    var dataSets = de.dataSets;
                                    if (!dataSets) {
                                        dataSets = [];
                                    }
                                    var dataSet = {dbGapId: m.get('VARIABLE_ID'), uri: uri};
                                    dataSets.push(dataSet);
                                    phenxInLoincInDbGap.push(phenx);
                                    mongo_cde.update(de, user, function (err, newDe) {
                                        doneOne();
                                    })
                                }
                                else {
                                    phenxInLoincNotInDbGap.push(phenx);
                                    doneOne();
                                }
                            });

                        });
                    }, function doneAll() {
                        stream.resume();
                    })
                });
                stream.on('end', function () {
                    var obj1 = new PhenxInLoincInDbGapModel({phenxInLoincInDbGap: phenxInLoincInDbGap});
                    obj1.save(function () {
                        console.log('phenxInLoincInDbGap saved.');
                        var obj2 = new PhenxInLoincNotInDbGapModel({phenxInLoincNotInDbGap: phenxInLoincNotInDbGap});
                        obj2.save(function () {
                            console.log('phenxInLoincNotInDbGap saved.');
                            cb();
                        });
                    });
                    cb();
                })
            } else {
                cb();
            }
        }], function (err) {
        if (err) console.log("ERROR: " + err);
        process.exit(0);
    });
}

init(2);