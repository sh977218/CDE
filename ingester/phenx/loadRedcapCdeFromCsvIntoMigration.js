var csv = require('csv');
var fs = require('fs');
var capitalize = require('capitalize');
var async = require('async');
var mongo_data = require('../../modules/system/node-js/mongo-data');
var MigrationDataElementModel = require('../createMigrationConnection').MigrationDataElementModel;
var MigrationProtocolModel = require('../createMigrationConnection').MigrationProtocolModel;
var updateShare = require('../updateShare');
var classificationShare = require('../../modules/system/shared/classificationShared');

var ZIP_PATH = require('../createMigrationConnection').PHENX_ZIP_BASE_FOLDER;

var createdCdes = [];
var foundLoincs = [];
var foundCdes = [];
var csvCount = 0;
var totalCdeCount = 0;

function createCde(data, formId, protocol) {
    var classificationArray = protocol['classification'];
    var variableName = data['Variable / Field Name'];
    var fieldLabel = data['Field Label'];
    var cde = {
        tinyId: mongo_data.generateTinyId(),
        naming: [{designation: capitalize.words(variableName.replace(/_/g, ' '))}],
        stewardOrg: {name: 'PhenX'},
        sources: [{sourceName: 'PhenX'}],
        classification: [{
            stewardOrg: {name: 'PhenX'},
            elements: [{name: 'REDCap', elements: []}]
        }],
        registrationState: {registrationStatus: 'Qualified'},
        properties: [{source: 'PhenX', key: 'Field Note', value: data['Field Note']}],
        ids: [{source: 'PhenX Variable', id: formId + '_' + data['Variable / Field Name'].trim()}],
        valueDomain: {}
    };
    if (fieldLabel.length > 0)
        cde.naming.push({
            designation: fieldLabel,
            source: 'PhenX',
            tags: [{tag: 'Question Text'}]
        });
    var fieldType = data['Field Type'];
    var validationType = data['Text Validation Type OR Show Slider Number'];
    if (validationType.trim() === 'date_mdy') {
        cde.valueDomain.datatype = 'Date';
        cde.valueDomain.datatypeDate = {
            format: 'mdy'
        }
    }
    else if (validationType.trim() === 'date_dmy') {
        cde.valueDomain.datatype = 'Date';
        cde.valueDomain.datatypeDate = {
            format: 'dmy'
        }
    } else if (validationType.trim() === 'notes') {
        cde.valueDomain.datatype = 'text';
    } else if (validationType.trim() === 'file') {
        cde.valueDomain.datatype = 'File';
    } else if (validationType.trim() === 'time') {
        cde.valueDomain.datatype = 'Time';
        cde.valueDomain.datatypeTime = {}
    } else if (validationType.trim() === 'integer' || validationType.trim() === 'number') {
        cde.valueDomain.datatype = 'Number';
        cde.valueDomain.datatypeNUmber = {
            precision: validationType.trim() === 'integer' ? 2 : 0
        };
        var textValidationMin = data['Text Validation Min'].trim();
        var textValidationMax = data['Text Validation Max'].trim();
        if (textValidationMin.length > 0) {
            cde.valueDomain.datatypeNUmber.minValue = Number(textValidationMin);
        }
        if (textValidationMax.length > 0) {
            cde.valueDomain.datatypeNUmber.maxValue = Number(textValidationMax);
        }
    } else {
        if (fieldType === 'yesno') {
            cde.valueDomain.datatype = 'Value List';
            cde.valueDomain.permissibleValues = [{
                permissibleValue: '1',
                valueMeaningName: 'Yes'
            }, {
                permissibleValue: '0',
                valueMeaningName: 'No'
            }];
        } else if (fieldType === 'calc') {
        } else if (data['Choices, Calculations, OR Slider Labels'].length > 0) {
            var pvText = data['Choices, Calculations, OR Slider Labels'];
            if (pvText && pvText.length > 0) {
                var permissibleValues = [];
                var pvArray = pvText.split('|');
                pvArray.forEach((pvText)=> {
                    var tempArray = pvText.toString().split(',');
                    permissibleValues.push({
                        permissibleValue: tempArray[0],
                        valueMeaningName: tempArray[1]
                    })
                });
                cde.valueDomain.permissibleValues = permissibleValues;
                cde.valueDomain.datatype = 'Value List';
            }
        } else {
            cde.valueDomain.datatype = 'text';
        }
    }
    updateShare.removeClassificationTree(cde, 'PhenX');
    classificationShare.classifyItem(cde, 'PhenX', classificationArray);
    return cde;
}

function findCde(data, formId, cb) {
    MigrationProtocolModel.find({protocolId: formId.replace('PX', '').trim()}).exec((e, protocols)=> {
        if (e) throw e;
        else if (protocols.length === 1) {
            var variableName = data['Variable / Field Name'];
            var query = {'ids.id': formId + '_' + variableName};
            var protocol = protocols[0].toObject();
            MigrationDataElementModel.find(query).exec((error, results)=> {
                if (error) throw error;
                else if (results.length === 0) {
                    var newCde = createCde(data, formId, protocol);
                    new MigrationDataElementModel(newCde).save((e, o)=> {
                        if (e) throw e;
                        else {
                            createdCdes.push(o.tinyId);
                            cb(o);
                        }
                    })
                }
                else {
                    console.log('found ' + results.length + ' cde in migration dataelements');
                    console.log(formId);
                    console.log(data);
                    process.exit(1);
                }
            });
        } else {
            console.log(formId + ' protocol not found. Skipping.');
            cb();
        }
    });
}

function doCSV(filePath, formId, doneCsv) {
    var cdeCount = 0;
    csv.parse(fs.readFileSync(filePath), {columns: true, relax_column_count: true}, function (err, rows) {
        async.forEachSeries(rows, (row, doneOneRow)=> {
            var fieldType = row['Field Type'].trim();
            //@todo
            if (fieldType === 'descriptive') {
                doneOneRow();
            } else {
                findCde(row, formId, function () {
                    cdeCount++;
                    totalCdeCount++;
                    console.log('cdeCount: ' + cdeCount);
                    doneOneRow();
                });
            }
        }, ()=> {
            console.log('totalCdeCount: ' + totalCdeCount);
            doneCsv();
        })
    });
}

async.series([function (cb) {
    MigrationDataElementModel.remove({}).exec(function (err) {
        if (err) throw err;
        else {
            console.log('Removed MigrationDataElementModel');
            cb();
        }
    })
}, function (cb) {
    var allZips = fs.readdirSync(ZIP_PATH);
    async.forEach(allZips, (item, doneOneItem)=> {
        try {
            var formId = item.replace('.zip', '');
            var instrumentPath = ZIP_PATH + '/' + item + '/instrument.csv';
            if (!fs.existsSync(instrumentPath)) {
                instrumentPath = ZIP_PATH + '/' + item + '/' + formId + '/instrument.csv';
            }
            doCSV(instrumentPath, formId, function () {
                csvCount++;
                console.log('csvCount: ' + csvCount);
                doneOneItem();
            });
        } catch (exception) {
            console.log(exception);
        }
    }, ()=> {
        cb();
    });
}], function (e) {
    if (e) throw e;
    console.log('finished all.');
    console.log(createdCdes.length + ' createdCdes: ' + createdCdes);
    console.log(foundLoincs.length + ' foundLoincs: ' + foundLoincs);
    console.log(foundCdes.length + ' foundCdes: ' + foundCdes);
    process.exit(1);
});

