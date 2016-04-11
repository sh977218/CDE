var mongoose = require('mongoose'),
    fs = require('fs'),
    config = require('../../modules/system/node-js/parseConfig'),
    async = require('async'),
    schemas = require('../../modules/cde/node-js/schemas')
    ;

var migrationConn = mongoose.createConnection(config.mongoMigrationUri);
var mongoConn = mongoose.createConnection(config.mongoUri);
migrationConn.once('open', function callback() {
    console.log('mongodb ' + config.database.migration.db + ' connection open');
});
mongoConn.once('open', function callback() {
    console.log('mongodb ' + config.database.appData.db + ' connection open');
});

var DataElementModel = mongoConn.model('DataElement', schemas.dataElementSchema);
var PhenxToLoincMappingModel = migrationConn.model('PhenxToLoincMapping', new mongoose.Schema({}, {
    strict: false,
    collection: 'PhenxToLoincMapping'
}));
var VariableCrossReferenceModel = migrationConn.model('VariableCrossReference', new mongoose.Schema({}, {
    strict: false,
    collection: 'VariableCrossReference'
}));

var studyUrlPre = "http://www.ncbi.nlm.nih.gov/gap/?term=";
var dataUrlPre = "ftp://ftp.ncbi.nlm.nih.gov/dbgap/studies/";
var modifiedDeCounter = 0;
var totalDeCounter = 0;

function run() {
    async.series([
        function (callback) {
            var deCond = {'stewardOrg.name': 'PhenX', archived: null};
            var stream = DataElementModel.find(deCond).stream();
            stream.on('data', function (de) {
                stream.pause();
                totalDeCounter++;
                var id = 0;
                var nbLoincId = 0;
                de.get('ids').forEach(function (i) {
                    if (i.source === 'LOINC') {
                        nbLoincId++;
                        id = i.id;
                    }
                });
                if (nbLoincId > 1) {
                    console.log('this cde has too many loinc id. cde tinyId:' + cde.get('tinyId'));
                    process.exit(0);
                }
                if (id === 0) {
                    console.log('can not found LOINC id in de: ' + de);
                    process.exit(0);
                }
                PhenxToLoincMappingModel.find({'LOINC Code': id}, function (err, phenxVariableArray) {
                    if (err) throw err;
                    var trs = '';
                    var dataSets = [];
                    var i = 0;
                    if (phenxVariableArray.length === 0) stream.resume();
                    async.forEach(phenxVariableArray, function (phenxVariable, doneOnePhenxVariable) {
                        i++;
                        var phenxVariableName = phenxVariable.get('VARNAME');
                        var phenxVariableId = phenxVariable.get('PhenX Variable');
                        var phenxVariableDescription = phenxVariable.get('VARDESC');
                        var idTd = '<td>' + i + '</td>';
                        var phenxVariableNameTd = '<td>' + phenxVariableName + '</td>';
                        var phenxVariableIdTd = '<td>' + phenxVariableId + '</td>';
                        var phenxVariableDescriptionTd = '<td>' + phenxVariableDescription + '</td>';
                        var tr = '<tr>' + idTd + phenxVariableNameTd + phenxVariableIdTd + phenxVariableDescriptionTd + '</tr>';
                        trs = trs + tr;
                        VariableCrossReferenceModel.find({'VARIABLE_ID': phenxVariableId}, function (err, dbGapArray) {
                            if (err) throw err;
                            var existingDbGapMapping = {};
                            dbGapArray.forEach(function (dbGap) {
                                dbGap = dbGap.toObject();
                                delete dbGap._id;
                                if (!existingDbGapMapping[JSON.stringify(dbGap)]) {
                                    existingDbGapMapping[JSON.stringify(dbGap)] = true;
                                    var dataSet = {};
                                    dataSet.notes = "PhenX Variable ID: " + phenxVariableId;
                                    dataSet.source = "dbGaP";
                                    dataSet.id = dbGap['dbGaP VARIABLE_ID'];
                                    dataSet.studyUri = studyUrlPre + dbGap['dbGaP VARIABLE_ID'];
                                    dataSet.dataUri = dataUrlPre + dbGap['dbGaP STUDY_ID'].split('.')[0];
                                    dataSets.push(dataSet);
                                }
                            });
                            doneOnePhenxVariable();
                        })
                    }, function doneAllPhenxVariables() {
                        var property = {key: 'PhenX Variables', valueFormat: 'html'};
                        var thead = '<thead><tr><th>#</th></th><th>Variable Name</th><th>Variable ID</th><th>Variable Description</th></tr></thead>';
                        var tbody = '<tbody>' + trs + '</tbody>';
                        property.value = "<table class='table table-striped'>" + thead + tbody + "</table>";
                        de.get('properties').push(property);
                        de.dataSets = dataSets;
                        de.save(function () {
                            modifiedDeCounter++;
                            console.log('modified de count: ' + modifiedDeCounter);
                            stream.resume();
                        })
                    });
                });
            });
            stream.on('end', function () {
                console.log('end of stream');
                callback();
            });
            stream.on('error', function () {
                if (err) console.log("ERROR: " + err);
                process.exit(0);
            });
        },
        function () {
            console.log('totalDeCounter: ' + totalDeCounter);
            process.exit(0);
        }
    ])
}

run();