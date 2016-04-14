var async = require('async'),
    DataElementModel = require('./../createConnection').DataElementModel,
    MigrationPhenxToLoincMappingModel = require('./../createConnection').MigrationPhenxToLoincMappingModel,
    MigrationVariableCrossReferenceModel = require('./../createConnection').MigrationVariableCrossReferenceModel
    ;

var studyUrlPre = "http://www.ncbi.nlm.nih.gov/gap/?term=";
var dataUrlPre = "ftp://ftp.ncbi.nlm.nih.gov/dbgap/studies/";
var modifiedCDE = 0;
var sameCDE = 0;
var totalCDE = 0;
var noLoincCode = [];

function run() {
    async.series([
        function (callback) {
            var stream = DataElementModel.find({'stewardOrg.name': 'PhenX', archived: null}).stream();
            stream.on('data', function (de) {
                stream.pause();
                totalCDE++;
                var loincId = 0;
                var nbLoincId = 0;
                de.get('ids').forEach(function (id) {
                    if (id.source === 'LOINC') {
                        nbLoincId++;
                        loincId = id.id;
                    }
                });
                if (nbLoincId > 1) {
                    console.log('this cde has too many loinc id. cde tinyId:' + de.get('tinyId'));
                    //noinspection JSUnresolvedVariable
                    process.exit(0);
                }
                if (loincId === 0) {
                    console.log('can not found LOINC id in de: ' + de);
                    //noinspection JSUnresolvedVariable
                    process.exit(0);
                }
                MigrationPhenxToLoincMappingModel.find({'LOINC Code': loincId}, function (err, phenxVariableArray) {
                    if (err) throw err;
                    var trs = '';
                    var dataSets = [];
                    var i = 0;
                    if (phenxVariableArray.length === 0) {
                        noLoincCode.push(loincId);
                        sameCDE++;
                        stream.resume();
                    } else {
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
                            MigrationVariableCrossReferenceModel.find({'VARIABLE_ID': phenxVariableId}, function (err, dbGapArray) {
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
                            });
                        }, function doneAllPhenxVariables() {
                            var property = {key: 'PhenX Variables', valueFormat: 'html'};
                            var thead = '<thead><tr><th>#</th></th><th>Variable Name</th><th>Variable ID</th><th>Variable Description</th></tr></thead>';
                            var tbody = '<tbody>' + trs + '</tbody>';
                            property.value = "<table class='table table-striped'>" + thead + tbody + "</table>";
                            de.get('properties').push(property);
                            de.dataSets = dataSets;
                            de.save(function () {
                                modifiedCDE++;
                                stream.resume();
                            });
                        });
                    }
                });
            });
            stream.on('end', function () {
                console.log('end of stream');
                console.log('total CDE: ' + totalCDE);
                console.log('modified CDE: ' + modifiedCDE);
                console.log('same CDE: ' + sameCDE);
                console.log('noLoincCode.length: ' + noLoincCode.length);
                callback();
            });
            stream.on('error', function (err) {
                if (err) console.log("ERROR: " + err);
                //noinspection JSUnresolvedVariable
                process.exit(0);
            });
        },
        function () {
            //noinspection JSUnresolvedVariable
            process.exit(0);
        }
    ]);
}

run();