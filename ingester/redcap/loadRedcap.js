var parser = require('csv-parser');
var fs = require('fs');
var async = require('async');
var mongo_data = require('../../modules/system/node-js/mongo-data');
var DataElementModel = require('../../modules/cde/node-js/mongo-cde').DataElement;
var FormModel = require('../../modules/form/node-js/mongo-form').Form;
var MigrationPhenxRedcapModel = require('../createMigrationConnection').MigrationPhenxRedcapModel;

var ZIP_PATH = 's:/MLB/CDE/phenx/www.phenxtoolkit.org/toolkit_content/redcap_zip/a';
var zipCount = 0;
var createdCdes = [];
var foundLoincs = [];
var foundCdes = [];

var REDCAP_DATATYPE_MAP = {
    'radio': 'Value List',
    'text': 'Text',
    'checkbox': 'Value List',
    'yesno': 'Date',
    'calc': 'Date',
    'file': '',
    'notes': ''
};

function convertSkipLogic(skipLogicMap, skipLogicText) {
    if (skipLogicText.length === 0)return skipLogicText;
    else {
        var result = '';
        while (skipLogicText.indexOf('[') !== -1) {
            var leftIndex = skipLogicText.indexOf('[');
            var rightIndex = skipLogicText.indexOf(']');
            var label = skipLogicText.substr(leftIndex, rightIndex).trim();
            result += skipLogicMap[label];
        }
    }
}

function convertCdeToQuestion(data, skipLogicMap, cde) {
    var question = {
        elementType: "question",
        label: data['Field Label'],
        cardinality: {min: 1, max: 1},
        skipLogic: {
            condition: convertSkipLogic(skipLogicMap, data['Branching Logic (Show field only if...)'])
        },
        question: {
            cde: {
                tinyId: cde.tinyId,
                version: cde.version,
                derivationRules: cde.derivationRules,
                name: cde.naming[0] ? cde.naming[0].designation : '',
                ids: cde.ids ? cde.ids : [],
                permissibleValues: []
            },
            datatype: REDCAP_DATATYPE_MAP[data['Field Type']],
            required: data['Required Field?'] ? data['Required Field?'] : false,
            uoms: cde.valueDomain.uom ? [cde.valueDomain.uom] : [],
            answers: []
        }
    };
    cde.naming.forEach(function (n) {
        if (!n.tags)n.tags = [];
        if (n.tags.filter(function (t) {
                return t.tag.toLowerCase().indexOf('Question Text') > 0;
            }).length > 0) {
            if (!n.designation || (n.designation && n.designation.trim().length === 0)) {
                question.label = cde.naming[0].designation ? cde.naming[0].designation : '';
                question.hideLabel = true;
            } else {
                question.label = n.designation;
            }
        }
    });

    if (question.question.datatype === 'Number') {
        question.question.datatypeNumber = cde.valueDomain.datatypeNumber ? cde.valueDomain.datatypeNumber : {};
    } else if (question.question.datatype === 'Text') {
        question.question.datatypeText = cde.valueDomain.datatypeText ? cde.valueDomain.datatypeText : {};
    } else if (question.question.datatype === 'Date') {
        question.question.datatypeDate = cde.valueDomain.datatypeDate ? cde.valueDomain.datatypeDate : {};
    } else if (question.question.datatype === 'Value List') {
        if (cde.valueDomain.permissibleValues.length === 0) throw ('Unknown CDE datatype: ' + cde.valueDomain.datatype);
        cde.valueDomain.permissibleValues.forEach(function (pv) {
            if (!pv.valueMeaningName || pv.valueMeaningName.trim().length === 0) {
                pv.valueMeaningName = pv.permissibleValue;
            }
            question.question.answers.push(pv);
            question.question.cde.permissibleValues.push(pv);
        });
    }
    return question;
}

function createCde(data, cb) {
    var cde = {
        tinyId: mongo_data.generateTinyId(),
        naming: [{designation: data['Variable / Field Name']}, {
            designation: data['Field Label'],
            tags: [{tag: 'Question Text'}]
        }],
        stewardOrg: {name: 'NLM'},
        sources: [{source: 'PhenX'}],
        registrationState: {registrationStatus: 'Qualified'},
        properties: [{source: '', key: 'Field Note', value: data['Field Note']}],
        ids: [{id: ''}]
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
            createdCdes.push(o.tinyId);
            cb(o);
        }
    })
}

function findInDataElement(loincId, cb) {
    var query = {'archived': null, 'ids.id': loincId};
    DataElementModel.find(query).exec((error, results)=> {
        if (error) throw error;
        else if (results.length === 0) {
            createCde(data, function (o) {
                cb(o);
            })
        } else if (results.length === 1) {
            foundCdes.push(results[0].tinyId);
            cb(results[0]);
        } else throw 'found ' + result.length + ' cdes with loincId: ' + loincId;
    })
}

function findQuestion(data, formId, cb) {
    var variableName = data['Variable / Field Name'];
    var variableDesc = data['Field Label'];
    var query = {
        'PhenX Variable': new RegExp('^' + formId + '$', 'i'),
        'OR': [{'VARNAME': formId.toUpperCase() + '_' + variableName},
            {'VARDESC': variableDesc}]
    };
    MigrationPhenxRedcapModel.find(query).exec((error, results)=> {
        if (error) throw error;
        else if (results.length === 0) {
            createCde(data, function (o) {
                cb(o);
            })
        }
        else if (results.length === 1) {
            var loincId = results[0]['LOINC CODE'];
            if (loincId) {
                foundLoincs.push(loincId);
                findInDataElement(loincId, function (o) {
                    cb(o);
                })
            } else throw 'unknown loincId: ' + loincId;
        } else cb();
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

function doCSV(filePath, form, formId, cb) {
    var skipLogicMap = {};
    var name = {};
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
        if (index === 1) {
            form.formElements.push({
                elementType: "section",
                label: data['Variable / Field Name'],
                instructions: {value: data['Field Label']},
                skipLogic: {condition: ''},
                formElements: []
            });
            stream.resume();
        }
        else {
            skipLogicMap[data['Variable / Field Name'].trim()] = data['Field Label'].trim();
            if (name.designation && name.designation !== data['Form Name']) {
                console.log('Form Name not match.');
                console.log('Form Name: ' + data['Form Name']);
                console.log('name.designation: ' + name.designation);
                process.exit(1);
            } else {
                name.designation = data['Form Name'];
            }
            findQuestion(data, formId, function (q) {
                var question = convertCdeToQuestion(data, skipLogicMap, q);
                form.formElements[0].formElements.push(question);
                stream.resume();
            });
        }

    });
    stream.on('err', function (err) {
        if (err) throw err;
    });
    stream.on('end', function () {
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

function doInstrumentID(filePath, formId, cb) {
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

function doZip(filePath, formId, cb) {
    fs.readdir(filePath, (err, items)=> {
        if (err) throw err;
        else {
            var fileCount = 0;
            var form = {
                tinyId: mongo_data.generateTinyId(),
                naming: [],
                ids: [],
                formElements: [],
                stewardOrg: {name: 'NLM'},
                sources: [{source: 'PhenX'}],
                registrationState: {registrationStatus: 'Qualified'}
            };
            var id = {};
            async.forEach(items, (item, doneOneItem)=> {
                if (item === 'instrument.csv') {
                    doCSV(filePath + '/instrument.csv', form, formId, function () {
                        console.log('done instrument.csv');
                        doneOneItem();
                    });
                } else if (item === 'AuthorID.txt') {
                    doAuthorID(filePath + '/AuthorID.txt', function (authorID) {
                        console.log('done authorID.txt');
                        id.source = authorID;
                        doneOneItem();
                    })
                } else if (item === 'InstrumentID.txt') {
                    doInstrumentID(filePath + '/InstrumentID.txt', formId, function (instrumentID) {
                        console.log('done instrumentID.txt');
                        id.id = instrumentID;
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
            var formId = item.replace('.zip', '');
            if (item.indexOf('.zip') !== -1) {
                doZip(ZIP_PATH + '/' + item, formId, function () {
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
