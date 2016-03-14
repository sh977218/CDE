var mongoose = require('mongoose'),
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

//var dcwDir = 'C:/Users/huangs8/Downloads/phenX/All_PhenX_DCW_Files/';

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
var phenxCounter = 0;
var phenxInLoinc = [];
var phenxNotInLoinc = [];

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
                        //var phenx = one.phenx;
                        var loinc = one.loinc[0];
                        //var dcwFile = dcwDir + phenx.DOCFILE.replace('.doc', '_Finalized.doc');
                        var id = loinc.LOINC_NUM;

                        mongo_cde.query({'archived': null, 'ids.id': id}, function (err, cdes) {
                            if (err) throw err;
                            console.log('h');
                            doneOne();
                        });
                    }, function doneAll() {
                        stream.resume();
                    })
                });
                stream.on('end', function () {
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