var parser = require('csv-parser');
var fs = require('fs');
var async = require('async');
var mongo_data = require('../../modules/system/node-js/mongo-data');
var MigrationDataElementModel = require('../createMigrationConnection').MigrationDataElementModel;

var ZIP_PATH = 's:/MLB/CDE/phenx/www.phenxtoolkit.org/toolkit_content/redcap_zip/all';
var createdCdes = [];
var foundLoincs = [];
var foundCdes = [];

function createCde(data, formId) {
    var cde = {
        tinyId: mongo_data.generateTinyId(),
        naming: [{designation: data['Variable / Field Name']}, {
            designation: data['Field Label'],
            tags: [{tag: 'Question Text'}]
        }],
        stewardOrg: {name: 'PhenX'},
        sources: [{source: 'PhenX'}],
        registrationState: {registrationStatus: 'Qualified'},
        properties: [{source: '', key: 'Field Note', value: data['Field Note']}],
        ids: [{source: 'PhenX', id: formId + '_' + data['Variable / Field Name'].trim()}]
    };
    if (data['Choices, Calculations, OR Slider Labels']) {
        var permissibleValues = [];
        var pvArray = data['Choices, Calculations, OR Slider Labels'].split('|');
        pvArray.forEach((pvText)=> {
            var tempArray = pvText.toString().split(',');
            permissibleValues.push({
                permissibleValue: tempArray[0],
                valueMeaningName: tempArray[0],
                valueMeaningCode: tempArray[1]
            })
        });
        cde.valueDomain = {permissibleValues: permissibleValues};
    }
    return cde;
}

function findCde(data, formId, cb) {
    var variableName = data['Variable / Field Name'];
    var query = {'ids.id': formId + '_' + variableName};
    MigrationDataElementModel.find(query).exec((error, results)=> {
        if (error) throw error;
        else if (results.length === 0) {
            var newCde = createCde(data, formId);
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
}

function validateCsvHeader(data, cb) {
    if (data.length !== 17)
        cb('header length is not 17.');
    else if (data[0] !== 'Variable / Field Name') {
        cb('header 0 is not Variable / Field Name.');
    } else if (data[1] !== 'Form Name') {
        cb('header 1 is not Form Name.');
    } else if (data[2] !== 'Section Header') {
        cb('header 2 is not Section Header.');
    } else if (data[3] !== 'Field Type') {
        cb('header 3 is not Field Type.');
    } else if (data[4] !== 'Field Label') {
        cb('header 4 is not Field Label.');
    } else if (data[5] !== 'Choices, Calculations, OR Slider Labels') {
        cb('header 5 is not Choices, Calculations, OR Slider Labels.');
    } else if (data[6] !== 'Field Note') {
        cb('header 6 is not Field Note.');
    } else if (data[7] !== 'Text Validation Type OR Show Slider Number') {
        cb('header 7 is not Text Validation Type OR Show Slider Number.');
    } else if (data[8] !== 'Text Validation Min') {
        cb('header 8 is not Text Validation Min.');
    } else if (data[9] !== 'Text Validation Max') {
        cb('header 9 is not Text Validation Max.');
    } else if (data[10] !== 'Identifier?') {
        cb('header 10 is not Identifier?.');
    } else if (data[11] !== 'Branching Logic (Show field only if...)') {
        cb('header 11 is not Branching Logic (Show field only if...).');
    } else if (data[12] !== 'Required Field?') {
        cb('header 12 is not Required Field?.');
    } else if (data[13] !== 'Custom Alignment') {
        cb('header 13 is not Custom Alignment.');
    } else if (data[14] !== 'Question Number (surveys only)') {
        cb('header 14 is not Question Number (surveys only).');
    } else if (data[15] !== 'Matrix Group Name') {
        cb('header 15 is not Matrix Group Name.');
    } else if (data[16] !== 'Matrix Ranking?') {
        cb('header 16 is not Matrix Ranking?.');
    } else {
        cb();
    }
}

function doCSV(filePath, formId, doneCsv) {
    var stream = fs.createReadStream(filePath).pipe(parser());
    var index = 0;
    stream.on('headers', function (data) {
        index = 0;
        validateCsvHeader(data, function (err) {
            if (err) {
                console.log(err);
                console.log(filePath);
                process.exit(1);
            }
        })

    });
    stream.on('data', function (data) {
        stream.pause();
        index++;
        var fieldType = data['Field Type'].trim();
        if (fieldType === 'descriptive') {
            stream.resume();
        }
        else {
            findCde(data, formId, function (q) {
                stream.resume();
            });
        }
    });
    stream.on('err', function (err) {
        if (err) throw err;
    });
    stream.on('end', function () {
        if (doneCsv) doneCsv();
        else {
            console.log(filePath);
            process.exit(1);
        }
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
                console.log('done instrument.csv');
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

