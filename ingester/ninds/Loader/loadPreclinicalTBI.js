import { BATCHLOADER } from 'ingester/shared/utility';

const fs = require('fs');
const util = require('util');
const async = require('async');
const _ = require('lodash');
const csv = require('csv');
const request = require('request');
const cheerio = require('cheerio');

const DataElementModel = require('../../../server/cde/mongo-cde').DataElement;
const FormModel = require('../../../server/form/mongo-form').Form;
const mongo_data = require('../../../server/system/mongo-data');

const UOM_MAP = {
    '': '',
    'Centimeter': 'cm',
    'Day': 'd',
    'Gram': 'g',
    'Minute': 'min',
    'Percentage': '%',
    'minute': 'min',
    'second': 's',
    'centimeter': 'cm',
    'lx': 'lx',
    'Hour': 'h',
    'Millimeter': 'mm',
    'Degree Celsius': 'Cel',
    'milligram': 'mg',
    'Decibel': 'cB',
    'milliAmpere': 'mA',
    'hours': 'h',
    'hour': 'h',
    'percentage': '%',
    'Newton': 'N',
    'day': 'd',
    'gram': 'g',
    'mm': 'mm',
    'cm': 'cm',
    'percent': '%',
    'days': 'd',
    'minutes': 'min',
    'hour:minutes': 'h:m',
    'cm/s': 'cm/s',
    's': 's',
    'Second': 's',
    'mA': 'mA',
    'Hz': 'Hz',
    'ms': 'ms',
    'Minutes': 'min',
    'Seconds': 's',
    'Meter': 'm',
    'millimeters': 'mm',
    'centimeters': 'cm',
    'hh:mm': 'h:m',
    'RPM/s': 'RPM/s',
    'RPM': 'RPM',
    'Month': 'mo',
    'Centimeter per second': 'cm/s',
    'kHz': 'kHz',
    'dB': 'dB',
    'Celcius': 'Cel',
    'integer': 'integer',
    'count': 'count',
    'Degree': 'Degree',
};

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
let UNPARSED_REF_DOC = new Set();

//const FILE_PATH = 'S:/MLB/CDE/NINDS/Preclinical TBI CDE/ALL_CDE3.csv';
const FILE_PATH = 'C:/Users/huangs8/Downloads/ALL_CDE3.csv';
const EXCLUDE_REF_DOC = [
    'No references available',
    'Please fill out'
];

let formCount = 0;
let deCount = 0;

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

function parseRefDoc(row, de, form, cb) {
    let pubmedUrl = 'https://www.ncbi.nlm.nih.gov/pubmed/?term=';
    let referencesString = getCell(row, 'References');
    EXCLUDE_REF_DOC.forEach(exclude_re_doc => {
        referencesString = referencesString.replace(exclude_re_doc, '').trim();
    });
    if (referencesString) {
        let regex = /\s*(PMID|PUBMED|pubmed\/)(:|,|\s)*(\s*\d*[.|,|\s]*)*/ig;
        let pmIdArray = referencesString.match(regex);
        if (pmIdArray)
            async.forEach(pmIdArray, (pmIdString, doneOne) => {
                let pmIds = pmIdString.replace(/PMID:/ig, '').replace(/\./ig, '').replace(/pubmed\//ig, '').replace(/PMID/ig, '').trim().split(',').filter(p => p);
                async.forEach(pmIds, (pmId, doneOneMore) => {
                    pmId = pmId.trim();
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
                            form.referenceDocuments.push({
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
                cb(null, de);
            });
        else {
            UNPARSED_REF_DOC.add(referencesString);
            de.referenceDocuments.push({
                document: referencesString
            });
            form.referenceDocuments.push({
                document: referencesString
            });
            cb(null, de);
        }
    } else cb(null, de);
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
            unitsOfMeasure: {system: '', code: cde.valueDomain.uom},
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

function rowToDataElement(row, form, cb) {
    let de = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {
            name: 'NINDS'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        createdBy: BATCHLOADER,
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
        unitOfMeasure = unitOfMeasure.trim();
        de.valueDomain.uom = UOM_MAP[unitOfMeasure];
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
            if (de.valueDomain.permissibleValues.length === 0) cb('bad pvs, permissibleValues is empty');
        } else cb('bad pvs');
    } else throw cb('bad input restriction');

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
    parseRefDoc(row, de, form, cb);
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
            let cond = {
                columns: true,
                rtrim: true,
                trim: true,
                relax_column_count: true,
                skip_empty_lines: true,
                skip_lines_with_empty_values: true
            };
            csv.parse(fs.readFileSync(FILE_PATH), cond, function (err, rows) {
                if (err) throw err;
                let allFormsArray = _.uniqBy(rows, 'Form');
                async.forEachSeries(allFormsArray, (oneForm, doneOneForm) => {
                    let form = {
                        tinyId: mongo_data.generateTinyId(),
                        stewardOrg: {
                            name: 'NINDS'
                        },
                        naming: [
                            {designation: _.words(oneForm.Form).join(" ")}
                        ],
                        registrationState: {
                            registrationStatus: 'Recorded'
                        },
                        createdBy: BATCHLOADER,
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
                    let oneFormArray = _.filter(rows, r => r.Form === oneForm.Form);
                    async.forEachSeries(oneFormArray, (row, doneOneRow) => {
                        let variableName = row['Variable Name'].trim();
                        DataElementModel.findOne({'ids.id': variableName}, (err, existingDE) => {
                                if (err) throw err;
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
                                    if (existingDE) {
                                        let question = deToQuestion(row, existingDE);
                                        formElements.push(question);
                                        lastSection = currentSection;
                                        doneOneRow();
                                    } else {
                                        rowToDataElement(row, form, (err, de) => {
                                            if (err)
                                                throw err;
                                            else {
                                                new DataElementModel(de).save((err, newCde) => {
                                                    if (err) throw err;
                                                    else {
                                                        let question = deToQuestion(row, newCde);
                                                        formElements.push(question);
                                                        lastSection = currentSection;
                                                        deCount++;
                                                        console.log('deCount: ' + deCount);
                                                        doneOneRow();
                                                    }
                                                });
                                            }
                                        });
                                    }
                                }
                            }
                        );
                    }, () => {
                        form.referenceDocuments = _.uniqBy(form.referenceDocuments, 'uri');
                        new FormModel(form).save(err => {
                            if (err) throw err;
                            formCount++;
                            console.log('formCount: ' + formCount);
                            doneOneForm();
                        });
                    });
                }, () => {
                    cb();
                });
            });
        }
    ], () => {
        console.log('all unit of measure:');
        console.log(ALL_UOM);
        console.log('all data type:');
        console.log(ALL_DATA_TYPE);
        console.log('unparsed ref doc:');
        console.log(UNPARSED_REF_DOC);
        process.exit(1);
    });
}

run();