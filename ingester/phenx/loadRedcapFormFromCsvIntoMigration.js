var parser = require('csv-parser');
var fs = require('fs');
var async = require('async');
var DataElementModel = require('../createNlmcdeConnection').DataElementModel;
var MigrationRedcapModel = require('../createMigrationConnection').MigrationRedcapModel;

//var ZIP_PATH = 's:/MLB/CDE/phenx/www.phenxtoolkit.org/toolkit_content/redcap_zip/all';
var ZIP_PATH = 's:/MLB/CDE/phenx/www.phenxtoolkit.org/toolkit_content/redcap_zip/test';
var zipCount = 0;
var createdCdes = [];
var foundLoincs = [];
var foundCdes = [];

var special_skipLogic = [];

var REDCAP_DATATYPE_MAP = {
    'radio': 'Value List',
    'text': 'Text',
    'checkbox': 'Value List',
    'yesno': 'Date',
    'calc': 'Date',
    'file': '',
    'notes': ''
};
var SYMBOL_MAP = {
    '<>': '',
    '<=': '',
    '>=': '',
    '=': '=',
    '>': '>',
    '<': '<'
};

var CONJUNCTION_MAP = {
    'and': ' AND ',
    'or': ' OR ',
    'AND': ' AND ',
    'OR': ' OR '
};

function formatSkipLogic(m, equationText) {
    var result = '';
    var foundLabelArray = equationText.match(/\[[^\[\]]*\]\s*/);
    if (foundLabelArray && foundLabelArray.length === 1) {
        var foundLabel = foundLabelArray[0];
        result += '"' + m[foundLabel.replace('[', '').replace(']', '').trim()] + '"';
        equationText = equationText.replace(foundLabel, '').trim();
        var foundSymbolArray = equationText.match(/[^']*\s/);
        if (foundSymbolArray && foundSymbolArray.length === 1) {
            var foundSymbol = foundSymbolArray[0];
            result += SYMBOL_MAP[foundSymbol.trim()];
            equationText = equationText.replace(foundSymbol.trim(), '').trim();
        }
        var foundValueWithSingQuoteArray = equationText.match(/'.*'/);
        if (foundValueWithSingQuoteArray && foundValueWithSingQuoteArray.length === 1) {
            var foundValueWithSingQuote = foundValueWithSingQuoteArray[0];
            return result += foundValueWithSingQuote.replace(/'/g, '"').trim();
        }
        var foundValueWithDoubleQuoteArray = equationText.match(/".*"/);
        if (foundValueWithDoubleQuoteArray && foundValueWithDoubleQuoteArray.length === 1) {
            var foundValueWithDoubleQuote = foundValueWithDoubleQuoteArray[0];
            return result += foundValueWithDoubleQuote.trim();
        }
        if (equationText.match(/'.*"/) && equationText.match(/".*'/)) {
            return null;
        }
        return result += '"' + equationText.trim() + '"';
    }
}

function convertSkipLogic(skipLogicMap, skipLogicText) {
    if (skipLogicText.trim().length === 0)return skipLogicText;
    else if (skipLogicText.trim().indexOf('(') > -1) {
        special_skipLogic.push(skipLogicText);
        return skipLogicText;
    }
    else {
        var loop_num = 0;
        var result = [];
        while (skipLogicText.trim().length > 0) {
            loop_num++;
            var foundEquationArray = skipLogicText.match(/\[[^[\]]*]\s*(?:<>|[<>]=|[=><])\s*['"]?[\w-]*['"]?/);
            if (foundEquationArray && foundEquationArray.length === 1) {
                var foundEquation = foundEquationArray[0];
                var cdeSkipLogicEquation = formatSkipLogic(skipLogicMap, foundEquation);
                if (cdeSkipLogicEquation === null) {
                    console.log(skipLogicText);
                    return null;
                }
                result.push(cdeSkipLogicEquation);
                skipLogicText = skipLogicText.replace(foundEquation, '').trim();
                var foundConjunctionArray = skipLogicText.match(/[^\[\]]*\s/);
                if (foundConjunctionArray && foundConjunctionArray.length === 1) {
                    var foundConjunction = foundConjunctionArray[0];
                    var cdeSkipLogicConjunction = CONJUNCTION_MAP[foundConjunction.trim()];
                    result.push(cdeSkipLogicConjunction);
                    skipLogicText = skipLogicText.replace(foundConjunction, '').trim();
                }
            }
            if (loop_num > 100) {
                console.log('loop over 100 time in while loop');
                console.log('skipLogicText: ' + skipLogicText);
                return null;
            }
        }
        return result.join('');
    }
}

function convertCdeToQuestion(data, skipLogicMap, cde) {
    var question = {
        elementType: "question",
        label: data['Field Label'],
        cardinality: {min: 1, max: 1},
        skipLogic: {
            condition: ''
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
    var branchLogic = data['Branching Logic (Show field only if...)'];
    var skipLogic = '';
    if (branchLogic && branchLogic.trim().length > 0) {
        skipLogic = convertSkipLogic(skipLogicMap, branchLogic);
        if (skipLogic === null || skipLogic === '') {
            console.log(data);
            return null;
        } else {
            question.skipLogic.condition = skipLogic;
        }
    }
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
    /*
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
     */
    return question;
}

function findInDataElement(data, formId, cb) {
    var variableName = data['Variable / Field Name'];
    var query = {'ids.id': formId + '_' + variableName};
    DataElementModel.find(query).exec((error, results)=> {
        if (error) throw error;
        else if (results.length === 1) {
            cb(results[0]);
        }
        else {
            console.log('found ' + results.length + ' cde: ');
            console.log(data);
            console.log(formId);
            process.exit(1);
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

function doCSV(filePath, redcap, formId, doneCsv) {
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
        var formElements;
        var fieldType = data['Field Type'].trim();
        if (fieldType === 'descriptive') {
            redcap.formElements.push({
                elementType: "section",
                label: data['Variable / Field Name'],
                instructions: {value: data['Field Label']},
                skipLogic: {condition: ''},
                formElements: []
            });
            formElements = redcap.formElements[0].formElements;
            stream.resume();
        }
        else {
            formElements = redcap.formElements;
            var formattedFieldLabel = data['Field Label'].replace(/"/g, "'").trim();
            var branchLogic = data['Branching Logic (Show field only if...)'];
            if (branchLogic && branchLogic.trim().indexOf('(') > -1) {
                special_skipLogic.push(branchLogic);
                redcap.branchLogic = branchLogic;
            }
            skipLogicMap[data['Variable / Field Name'].trim()] = formattedFieldLabel;
            if (name.designation && name.designation !== data['Form Name']) {
                console.log('Form Name not match.');
                console.log('Form Name: ' + data['Form Name']);
                console.log('name.designation: ' + name.designation);
                process.exit(1);
            } else {
                name.designation = data['Form Name'];
            }
            findInDataElement(data, formId, function (cde) {
                var question = convertCdeToQuestion(data, skipLogicMap, cde);
                if (question === null) {
                    console.log('filePath ' + filePath);
                    console.log('line ' + index);
                    process.exit(1);
                }
                formElements.push(question);
                stream.resume();
            });
        }
    });
    stream.on('err', function (err) {
        if (err) throw err;
    });
    stream.on('end', function () {
        redcap.name = name;
        doneCsv();
    });
}

function doZip(filePath, formId, doneZip) {
    var redcap = {
        formElements: []
    };
    async.series([
        function doAuthorID(cb) {
            fs.readFile(filePath + '/AuthorID.txt', 'utf8', function (err, data) {
                if (err) throw err;
                else if (data === 'PhenX') {
                    redcap.authorId = data;
                    cb();
                } else {
                    console.log('unknown authorID ' + data);
                    console.log(filePath);
                    process.exit(1);
                }
            })
        },
        function doInstrumentID(cb) {
            fs.readFile(filePath + '/InstrumentID.txt', 'utf8', function (err, data) {
                if (err) throw err;
                else if (data.indexOf('PX') !== -1) {
                    redcap.instrumentId = data;
                    cb();
                } else {
                    console.log('unknown instrumentID ' + data);
                    console.log(filePath);
                    process.exit(1);
                }
            })
        },
        function doAttachment(cb) {
            cb()
        },
        function (cb) {
            var instrumentPath = filePath + '/instrument.csv';
            if (!fs.existsSync(instrumentPath)) {
                instrumentPath = filePath + '/' + formId + '/instrument.csv';
            }
            doCSV(instrumentPath, redcap, formId, function () {
                console.log('done instrument.csv');
                cb();
            });
        }
    ], () => {
        new MigrationRedcapModel(redcap).save((e)=> {
            if (e) throw e;
            else doneZip();
        })
    });
}

async.series([function (cb) {
    MigrationRedcapModel.remove({}).exec(function (err) {
        if (err) throw err;
        else {
            console.log('finished remove MigrationRedcapModel');
            cb();
        }
    })
}, function (cb) {
    var allZips = fs.readdirSync(ZIP_PATH);
    async.forEachSeries(allZips, (item, doneOneItem)=> {
        try {
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
        } catch (exception) {
            console.log(exception);
        }
    }, (a)=> {
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

