const fs = require('fs');
const util = require('util');
const async = require('async');
const _ = require('lodash');
const csv = require('csv');
const request = require('request');
const cheerio = require('cheerio');

const DataElementModel = require('../../../modules/cde/node-js/mongo-cde').DataElement;
const FormModel = require('../../../modules/form/node-js/mongo-form').Form;
const mongo_data = require('../../../modules/system/node-js/mongo-data');

const DATA_TYPE_MAP = {
    'Alphanumeric': 'Text',
    'Date or Date & Time': 'Date',
    'Numeric Values': 'Number',
    'Numeric': 'Number',
    'numeric Values': 'Number',
    'Numeric values': 'Number',
    'Time': 'Text',
    'alphanumeric': 'Text'
};

let ALL_UOM = new Set();
let ALL_DATA_TYPE = new Set();

const FILE_PATH = 'S:/MLB/CDE/NINDS/Preclinical TBI CDE/';
const EXCLUDE_FILE = [];
const EXCLUDE_REF_DOC = [
    'No references available',
    'Please fill out'
];

let log_file = fs.createWriteStream(__dirname + '/debug.log', {flags: 'w'});
let log_stdout = process.stdout;

console.log = function (d) {
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};

function getCell(row, header) {
    if (row[header])
        return row[header];
    else {
        let headerLower = _.toLower(header);
        if (row[headerLower])
            return row[headerLower];
        else return "";
    }
}

function parseRefDoc(row, de, file, cb) {
    let pubmedUrl = 'https://www.ncbi.nlm.nih.gov/pubmed/?term=';
    let referencesString = getCell(row, 'References');
    EXCLUDE_REF_DOC.forEach(exclude_re_doc => {
        referencesString = referencesString.replace(exclude_re_doc, '').trim();
    });
    if (referencesString) {
        let regex = /\s*(PMID|PUBMED)(:|,|\s)(\s*\d*[.|,|\s]*)*/ig;
        let pmIdArray = referencesString.match(regex);
        if (pmIdArray)
            async.forEach(pmIdArray, (pmIdString, doneOne) => {
                let pmIds = pmIdString.replace(/PMID:/ig, '').replace(/\./ig, '').trim().split(',').filter(p => p);
                async.forEach(pmIds, (pmId, doneOneMore) => {
                    let uri = pubmedUrl + pmId;
                    request(uri, (err, response, body) => {
                        if (err) cb(err);
                        else if (response.statusCode === 200) {
                            let $ = cheerio.load(body);
                            let title = $('.rprt_all h1').text();
                            let abstracttext = $('abstracttext').text();
                            de.referenceDocuments.push({
                                docType: 'text',
                                title: title,
                                uri: uri,
                                source: 'PubMed',
                                languageCode: 'en-us',
                                document: abstracttext
                            });
                            doneOneMore();
                        } else throw "status: " + response.statusCode;
                    });
                }, () => {
                    doneOne();
                });
            }, () => {
                cb();
            });
        else {
            console.log(file + " did not find pubmed id in:\n" + referencesString + "\n\n--------------------------");
            de.referenceDocuments.push({
                document: referencesString
            });
            cb();
        }
    } else cb();

}

function deToQuestion(row, cde) {
    let question = {
        elementType: 'question',
        label: '',
        instructions: {
            value: ''
        },
        question: {
            cde: {
                tinyId: cde.tinyId,
                name: cde.naming[0].designation,
                version: cde.version,
                permissibleValues: cde.valueDomain.permissibleValues,
                ids: cde.ids,
                derivationRules: cde.derivationRules
            },
            datatype: cde.valueDomain.datatype,
            datatypeNumber: cde.valueDomain.datatypeNumber,
            datatypeText: cde.valueDomain.datatypeText,
            datatypeDate: cde.valueDomain.datatypeDate,
            uoms: cde.valueDomain.uom,
            answers: cde.valueDomain.permissibleValues
        },
        formElements: []
    };
    if (row['Preferred Question Text'])
        question.label = row['Preferred Question Text'];
    else question.label = cde.naming[0].designation;

    if (row['Guidelines/Instructions'])
        question.instructions.value = row['Guidelines/Instructions'];

    if (row['Input Restriction'].indexOf('Multiple Pre-Defined Values Selected') > -1)
        question.question.multiselect = true;
    return question;
}

function rowToDataElement(file, row) {
    let de = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {
            name: 'NINDS'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        createdBy: {
            username: 'batchloader'
        },
        referenceDocuments: [],
        properties: [],
        valueDomain: {},
        classification: [{
            stewardOrg: {name: 'NINDS'},
            elements: [{
                name: 'Preclinical TBI',
                elements: []
            }]
        }]
    };

    let variableName = getCell(row, 'Variable Name');
    if (variableName) {
        de.ids = [{
            source: 'NINDS Preclinical',
            id: row['Variable Name'],
            version: '1'
        }];
    }

    let shortDescription = getCell(row, 'Short Description');
    let description = getCell(row, 'Definition');
    let title = getCell(row, 'Title');
    let preferredQuestionText = getCell(row, 'Preferred Question Text');

    de.naming = [];
    if (title === preferredQuestionText)
        de.naming.push({
            designation: title,
            tags: ['Preferred Question Text']
        });
    else {
        de.naming.push({
            designation: title,
        });
        de.naming.push({
            designation: preferredQuestionText,
            tags: ['Preferred Question Text']
        });
    }
    if (shortDescription === description)
        de.naming[0].definition = description;
    else {
        de.naming[0].definition = description;
        if (de.naming[1])
            de.naming[1].definition = shortDescription;
        else de.naming[1] = {definition: shortDescription};
    }

    let unitOfMeasure = getCell(row, 'Unit of Measure');
    if (unitOfMeasure) {
        de.valueDomain.uom = unitOfMeasure;
        ALL_UOM.add(unitOfMeasure);
    }
    if (row['Datatype']) ALL_DATA_TYPE.add(row['Datatype']);
    let inputRestrictionString = getCell(row, 'Input Restriction').toLowerCase();
    if (inputRestrictionString === 'free-form entry' || inputRestrictionString.trim().length === 0) {
        let datatype = DATA_TYPE_MAP[row['Datatype']];
        if (datatype === 'Text') {
            de.valueDomain.datatype = 'Text';
            de.valueDomain.datatypeText = {};
            let maximumCharacterQuantity = getCell(row, 'Maximum Character Quantity');
            if (maximumCharacterQuantity) de.valueDomain.datatypeText.maxLength = maximumCharacterQuantity;
        } else if (datatype === 'Number') {
            de.valueDomain.datatype = 'Number';
            de.valueDomain.datatypeNumber = {};
            let minimumValue = getCell(row, 'Minimum Value');
            if (minimumValue) de.valueDomain.datatypeNumber.minValue = Number.parseInt(minimumValue);
            let maximumValue = getCell(row, 'Maximum Value');
            if (maximumValue) de.valueDomain.datatypeNumber.maxValue = Number.parseInt(maximumValue);
        } else if (datatype === 'Date') {
            de.valueDomain.datatypeDate = {};
        } else {
            de.valueDomain.datatype = 'Text';
            de.valueDomain.datatypeText = {};
        }
    } else if (inputRestrictionString === 'single pre-defined value selected' || 'multiple pre-defined values selected') {
        de.valueDomain.datatype = 'Value List';
        de.valueDomain.permissibleValues = [];
        let permissibleValueString = getCell(row, 'Permissible Values');
        let permissibleValueOutputCodes = getCell(row, 'Permissible Value Output Codes');
        if (permissibleValueString) {
            let permissibleValueArray = permissibleValueString.split(';').filter(t => t);
            let pvCodes = permissibleValueOutputCodes.split(';').filter(t => t);
            permissibleValueArray.forEach((pv, i) => {
                let permissibleValue = {
                    permissibleValue: pvCodes[i] ? pvCodes[i] : pv,
                    valueMeaningName: pv
                };
                de.valueDomain.permissibleValues.push(permissibleValue);
            });
            if (de.valueDomain.permissibleValues.length === 0) throw 'bad pvs, permissibleValues is empty. file: ' + file;
        } else
            throw 'bad pvs. file: ' + file;
    } else throw 'bad input restriction. file: ' + file;

    let keywords = getCell(row, 'Keywords');
    if (keywords) de.properties.push({key: "Keywords", value: keywords});
    let guidelinesInstructions = getCell(row, 'Guidelines/Instructions');
    if (guidelinesInstructions) de.properties.push({key: "Guidelines/Instructions", value: guidelinesInstructions});
    let notes = getCell(row, 'Notes');
    if (notes) de.properties.push({key: "Notes", value: notes});

    let taxonomyString = getCell(row, 'Taxonomy');
    if (taxonomyString) {
        let taxonomyArray = taxonomyString.split(';').filter(t => t);
        if (taxonomyArray.length > 0)
            de.classification[0].elements[0].elements.push({name: 'Taxonomy', elements: []});
        taxonomyArray.forEach(t => {
            de.classification[0].elements[0].elements[0].elements.push({name: t, elements: []});
        });
    }
    return de;
}

function saveDataElement(de, row, file, cb) {
    if (row['Element Type'].indexOf('Unique Data Element') > -1)
        new DataElementModel(de).save(cb);
    else if (row['Element Type'].indexOf('Common Data Element') > -1) {
        DataElementModel.findOne({'ids.id': de.ids[0].id}, (err, existingDe) => {
            if (err) throw err;
            else if (!existingDe)
                new DataElementModel(de).save(cb);
            else
                new DataElementModel(de).save(cb);
        });
    } else if (row['Element Type'].trim().length === 0) {
        console.log("Empty Element Type. on file " + file);
        new DataElementModel(de).save(cb);
    } else if (row['Element Type'].indexOf('Type of animal subject pre-injury housing including individual or group housing') > -1) {
        console.log("Element Type: " + row['Element Type'] + " on file " + file);
        new DataElementModel(de).save(cb);
    } else throw "Unknown Element Type. on file " + file;
}

function run() {
    async.series([
        /*
                function (cb) {
                    DataElementModel.remove({}, err => {
                        if (err) throw err;
                        cb();
                    });
                },
                function (cb) {
                    FormModel.remove({}, err => {
                        if (err) throw err;
                        cb();
                    });
                },
        */
        function (cb) {
            let files = fs.readdirSync(FILE_PATH).filter(f => _.indexOf(EXCLUDE_FILE, f) === -1);
            async.forEachSeries(files, (file, doneOneFile) => {
                let cond = {
                    columns: true,
                    rtrim: true,
                    trim: true,
                    relax_column_count: true,
                    skip_empty_lines: true,
                    skip_lines_with_empty_values: true
                };
                csv.parse(fs.readFileSync(FILE_PATH + file), cond, function (err, rows) {
                    if (err) throw err;
                    let formNameString = file.substring(0, file.indexOf('_'));
                    let form = {
                        tinyId: mongo_data.generateTinyId(),
                        stewardOrg: {
                            name: 'NINDS'
                        },
                        naming: [
                            {designation: _.words(formNameString).join(" ")}
                        ],
                        registrationState: {
                            registrationStatus: 'Qualified'
                        },
                        createdBy: {
                            username: 'batchloader'
                        },
                        referenceDocuments: [],
                        properties: [],
                        formElements: [],
                        classification: [{
                            stewardOrg: {name: 'NINDS'},
                            elements: [{
                                name: 'Preclinical TBI',
                                elements: []
                            }]
                        }]
                    };
                    let lastSection = "";
                    let currentSection = "";
                    let formElements = form.formElements;
                    let rowIndex = 0;
                    async.forEachSeries(rows, (row, doneOneRow) => {
                        let de = rowToDataElement(file, row);
                        parseRefDoc(row, de, file, err => {
                                if (err) throw err;
                                if (!de.naming || !de.naming[0].designation)
                                    throw file + ' has empty row: ' + rowIndex + '. Variable: ' + getCell(row, 'Variable Name');
                                saveDataElement(de, row, file, (err, newCde) => {
                                    if (err) throw file + row + de + err;
                                    else {
                                        currentSection = getCell(row, 'Category/Group');
                                        if (currentSection !== lastSection) {
                                            let newSection = {
                                                elementType: 'section',
                                                label: currentSection,
                                                formElements: []
                                            };
                                            form.formElements.push(newSection);
                                            formElements = newSection.formElements;
                                        }
                                        let question = deToQuestion(row, newCde);
                                        formElements.push(question);
                                        lastSection = currentSection;
                                        rowIndex++;
                                        doneOneRow();
                                    }
                                });
                            }
                        );
                    }, () => new FormModel(form).save(err => {
                        if (err) throw err;
                        doneOneFile();
                    }));
                });
            }, () => cb());
        }
    ], () => {
        console.log('all unit of measure: \n');
        console.log(ALL_UOM);
        console.log('all data type: \n');
        console.log(ALL_DATA_TYPE);
        process.exit(1);
    });
}

run();