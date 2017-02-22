var csv = require('csv');
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
    'yesno': 'Value List',
    'calc': 'Text',
    'file': 'File',
    'notes': 'Textarea'
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
                permissibleValues: cde.valueDomain.permissibleValues ? cde.valueDomain.permissibleValues : []
            },
            datatype: REDCAP_DATATYPE_MAP[data['Field Type']],
            required: data['Required Field?'] ? data['Required Field?'] : false,
            uoms: cde.valueDomain.uom ? [cde.valueDomain.uom] : [],
            answers: cde.valueDomain.permissibleValues ? cde.valueDomain.permissibleValues : []
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

function doCSV(filePath, redcap, formId, doneCsv) {
    var skipLogicMap = {};
    var name = {};
    csv.parse(fs.readFileSync(filePath), {columns: true, relax_column_count: true}, function (err, rows) {
        var newSection = true;
        async.forEachSeries(rows, (row, doneOneRow)=> {
            var formElements;
            var fieldType = row['Field Type'].trim();
            if (fieldType === 'descriptive') {
                if (newSection) {
                    redcap.formElements.push({
                        elementType: "section",
                        label: row['Variable / Field Name'],
                        instructions: {value: row['Field Label']},
                        skipLogic: {condition: ''},
                        formElements: []
                    });
                } else {
                    //@todo
                }
                newSection = false;
                formElements = redcap.formElements[0].formElements;
                doneOneRow()
            }
            else {
                newSection = true;
                formElements = redcap.formElements;
                var formattedFieldLabel = row['Field Label'].replace(/"/g, "'").trim();
                var branchLogic = row['Branching Logic (Show field only if...)'];
                if (branchLogic && branchLogic.trim().indexOf('(') > -1) {
                    special_skipLogic.push(branchLogic);
                    redcap.branchLogic = branchLogic;
                }
                skipLogicMap[row['Variable / Field Name'].trim()] = formattedFieldLabel;
                if (name.designation && name.designation !== row['Form Name']) {
                    console.log('Form Name not match.');
                    console.log('Form Name: ' + row['Form Name']);
                    console.log('name.designation: ' + name.designation);
                    process.exit(1);
                } else {
                    name.designation = row['Form Name'];
                }
                findInDataElement(row, formId, function (cde) {
                    var question = convertCdeToQuestion(row, skipLogicMap, cde);
                    if (question === null) {
                        console.log('filePath ' + filePath);
                        console.log('line ' + index);
                        process.exit(1);
                    }
                    formElements.push(question);
                    doneOneRow();
                });
            }

        }, ()=> {
            redcap.name = name;
            doneCsv();
        })
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

