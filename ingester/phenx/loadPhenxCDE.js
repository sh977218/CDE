var mongoose = require('mongoose'),
    fs = require('fs'),
    config = require('../../modules/system/node-js/parseConfig'),
    async = require('async'),
    schemas = require('../../modules/cde/node-js/schemas'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde')
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

var user = {username: 'batchloader'};

var dbGapUrlPre = 'https://www.phenxtoolkit.org/index.php?pageLink=browse.gapmapping&vname=';
var dbGapUrlPost = '&vid=';

function run(taskNum) {
    var deCond = {'stewardOrg.name': 'PhenX', archivedL: null};
    var stream = DataElementModel.find(deCond).stream();
    stream.on('data', function (de) {
        stream.pause();
        var id = '';
        de.get('ids').forEach(function (i) {
            if (i.source === 'LOINC') id = i.id;
        });
        if (id.length === 0) {
            console.log('can not found LOINC id in de: ' + de);
            proces.exit(1);
        }
        PhenxToLoincMappingModel.find({'LOINC Code': id}, function (err, phenxVariableArray) {
            if (err) throw err;
            if (phenxVariableArray.length === 0) {
                console.log('can not found mapping of id: ' + id);
                process.exit(1);
            }
            else {
                var property = {key: 'PhenX Variables', valueFormat: 'html'};
                var th = '<tr><th>Variable Name</th><th>Variable ID</th><th>Variable Description</th><th>Version</th><th>Mapping</th></tr>';
                var trs = '';
                async.forEach(phenxVariableArray, function (phenxVariable, doneOnePhenxVariable) {
                    var td1 = '<td>' + phenxVariable["VARNAME"] + '</td>';
                    var td2 = '<td>' + phenxVariable["PhenX Variable"] + '</td>';
                    var td3 = '<td>' + phenxVariable["VARDESC"] + '</td>';
                    var tr = '<tr>' + td1 + td2 + td3 + '</tr>';
                    trs = trs + tr;
                    var tbody = '<tbody>' + th + trs + '</tbody>';
                    property.value = '<table class="table table-striped">' + tbody + '</table>';
                    de.get('properties').push(property);
                    VariableCrossReferenceModel.find({'VARIABLE_ID': phenxVariable["PhenX Variable"]}, function (err, dbGapArray) {
                        if (err) throw err;
                        if (dbGapArray.length > 0) {
                            
                        }
                    })
                }, function doneAllPhenxVariables() {
                    de.save(function () {
                        stream.resume();
                    })
                });
            }
        });
    });
    stream.on('end', function () {
        console.log('end of stream');
        process.exit(0);
    });
    stream.on('error', function () {
        if (err) console.log("ERROR: " + err);
        process.exit(0);
    })
};

run();