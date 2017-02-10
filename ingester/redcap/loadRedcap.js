var parser = require('csv-parser');
var fs = require('fs');
var async = require('async');
var DataElementModel = require('../../modules/cde/node-js/mongo-cde').DataElement;
var FormModel = require('../../modules/form/node-js/mongo-form').Form;
var MigrationVariableCrossReferenceModel = require('../createMigrationConnection').MigrationVariableCrossReferenceModel;

var ZIP_PATH = 's:/MLB/CDE/phenx/www.phenxtoolkit.org/toolkit_content/redcap_zip/a';
var zipCount = 0;

function findVariableCrossReference(data, cb) {
    var variableName = data['Variable / Field Name'];
    var query = {'VARIABLE_NAME': variableName};
    MigrationVariableCrossReferenceModel.find(query).exec((e, variables)=> {
        if (e)throw e;
        else {

        }
    });
}

function findCde(data, cb) {
    var variableName = data['Field Note'];
    var query = {
        archived: null,
        'properties.key': 'PhenX Variables',
        'properties.value': new RegExp('^' + variableName + '$', 'i')
    };
    findVariableCrossReference(data, function () {

    });
    DataElementModel.find(query).exec((err, cdes) => {
        console.log(data);
        if (err) throw err;
        else if (cdes.length === 0) {
            var cde = {
                naming: [{designation: data['Variable / Field Name']}]
            };
            if (data['Choices, Calculations, OR Slider Labels']) {
                var permissibleValues = [];
                var pvArray = data['Choices, Calculations, OR Slider Labels'].split('|');
                pvArray.forEach((o)=> {
                    var temp = o.split(',');
                    permissibleValues.push({
                        permissibleValue: temp[0],
                        valueMeaningName: temp[0],
                        valueMeaningCode: temp[1]
                    })
                });
                cde.valueDomain = {permissibleValues: permissibleValues};
            }
            new DataElementModel(cde).save((e, o)=> {
                if (e) throw e;
                else {
                    cb(o);
                }
            })
        } else if (cdes.length === 1) {
            cb(cdes[0]);
        }
    })
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

function doCSV(filePath, form, cb) {
    var name = {};
    var stream = fs.createReadStream(filePath).pipe(parser());
    stream.on('headers', function (data) {
        validateCsvHeader(data, function (err) {
            if (err) {
                console.log(err);
                console.log(filePath);
                process.exit(1);
            }
        })

    });
    stream.on('data', function (data) {
        if (name.designation && name.designation !== data['Form Name']) {
            console.log('Form Name not match.');
            console.log('Form Name: ' + data['Form Name']);
            console.log('name.designation: ' + name.designation);
            process.exit(1);
        } else {
            name.designation = data['Form Name'];
        }
        findCde(data, function (fe) {
            form.formElement.push(fe);
            console.log('');
        });
    });
    stream.on('err', function (err) {
        if (err) throw err;
    });
    stream.on('close', function () {
        form.naming.push(name);
        cb();
    });
}

function doAuthorID(filePath, cb) {
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) throw err;
        else if (data === 'PhenX') {
            return cb(data);
        } else {
            console.log('unknown authorID ' + data);
            console.log(filePath);
            process.exit(1);
        }
    })
}
function doInstrumentID(filePath, cb) {
    fs.readFile(filePath, 'utf8', function (err, data) {
        if (err) throw err;
        else if (data.indexOf('PX') !== -1) {
            return cb(data);
        } else {
            console.log('unknown instrumentID ' + data);
            console.log(filePath);
            process.exit(1);
        }
    })
}

function doZip(filePath, cb) {
    fs.readdir(filePath, (err, items)=> {
        if (err) throw err;
        else {
            var fileCount = 0;
            var form = {naming: [], ids: [], formElements: []};
            var id = {};
            async.forEach(items, (item, doneOneItem)=> {
                if (item === 'instrument.csv') {
                    doCSV(filePath + '/instrument.csv', form, function () {
                        console.log('done instrument');
                        doneOneItem();
                    });
                } else if (item === 'AuthorID.txt') {
                    doAuthorID(filePath + '/AuthorID.txt', function (authorID) {
                        id = {source: authorID};
                        doneOneItem();
                    })
                } else if (item === 'InstrumentID.txt') {
                    doInstrumentID(filePath + '/InstrumentID.txt', function (instrumentID) {
                        id = {id: instrumentID};
                        doneOneItem();
                    })
                }
            }, ()=> {
                form.ids.push(id);
                new FormModel(form).save((e, o)=> {
                    if (e) throw e;
                    else {
                        console.log('finished ' + filePath + ' fileCount: ' + fileCount);
                        cb();
                    }
                })
            })
        }
    })
}

fs.readdir(ZIP_PATH, (err, items) => {
    if (err) throw err;
    else {
        async.forEachSeries(items, (item, doneOneItem)=> {
            if (item.indexOf('.zip') !== -1) {
                doZip(ZIP_PATH + '/' + item, function () {
                    zipCount++;
                    console.log('zipCount: ' + zipCount);
                    doneOneItem();
                });
            } else {
                console.log('do not know what to do with ' + item);
                doneOneItem();
            }
        }, ()=> {
            console.log('finished all.');
        });
    }
});
