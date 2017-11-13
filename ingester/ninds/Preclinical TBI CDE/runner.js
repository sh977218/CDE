const fs = require('fs');
const util = require('util');
const async = require('async');
const _ = require('lodash');
const csv = require('csv');

const DataElementModel = require('../../../modules/cde/node-js/mongo-cde').DataElement;
const FormModel = require('../../../modules/form/node-js/mongo-form').Form;
const mongo_data = require('../../../modules/system/node-js/mongo-data');
const config = require('../../../modules/system/node-js/parseConfig');

const DATA_TYPE_MAP = {
    'Alphanumeric': 'Text',
    'Date or Date & Time': 'Date',
    'Numeric Values': 'Number',
    'Numeric': 'Number'
};

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
    if (row[header]) return row[header];
    else {
        let headerLower = _.toLower(header);
        if (row[headerLower]) return row[headerLower];
    }
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
                permissibleValues: cde.valueDomain.permissibleValue,
                ids: cde.ids,
                derivationRules: cde.derivationRules
            },
            datatype: cde.valueDomain.datatype,
            datatypeNumber: cde.valueDomain.datatypeNumber,
            datatypeText: cde.valueDomain.datatypeText,
            datatypeDate: cde.valueDomain.datatypeDate,
            uoms: cde.valueDomain.uom,
            answers: []
        },
        formElements: []
    };
    if (row['Preferred Question Text'])
        question.label = row['Preferred Question Text'];
    else question.label = cde.naming[0].designation;

    if (row['Guidelines/Instructions'])
        question.instructions.value = row['Guidelines/Instructions'];

    if (row['Permissible Values'] && row['Permissible Value Descriptions'] && row['Permissible Value Output Codes']) {
        let pvs = row['Permissible Values'].split(';');
        let pvDescs = row['Permissible Value Descriptions'].split(';');
        let pvCodes = row['Permissible Value Output Codes'].split(';');
        for (let i = 0; i < pvs.length; i++) {
            let pv = {
                permissibleValue: pvs[i],
                valueMeaningDefinition: pvDescs[i],
                valueMeaningCode: pvCodes[i]
            };
            question.question.answers.push(pv);
        }
    }
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

    /*
        let effectiveDateString = getCell(row, 'Effective Date');
        if (effectiveDateString)
            de.registrationState.effectiveDate = new Date(effectiveDateString);
        let untilDateString = getCell(row, 'Until Date');
        if (untilDateString)
            de.registrationState.untilDate = new Date(untilDateString);
    */

    let variableName = getCell(row, 'Variable Name');
    if (variableName) {
        de.ids = [{
            source: 'NINDS',
            id: row['Variable Name']
        }];
    }

    let shortDescription = getCell(row, 'Short Description');
    let description = getCell(row, 'Definition');
    let title = getCell(row, 'Title');
    if (shortDescription === description) {
        de.naming = [{
            designation: title,
            definition: description
        }];
    } else {
        de.naming = [{
            designation: title,
            definition: shortDescription
        }, {
            designation: '',
            definition: description
        }];
    }
    let preferredQuestionText = getCell(row, 'Preferred Question Text');
    if (preferredQuestionText) {
        de.naming.push({
            designation: preferredQuestionText,
            definition: '',
            tags: ['Preferred Question Text']
        });
    }

    let unitOfMeasure = getCell(row, 'Unit of Measure');
    if (unitOfMeasure) de.valueDomain.uom = unitOfMeasure;
    let inputRestriction = getCell(row, 'Input Restriction');
    if (inputRestriction === 'Free-Form Entry') {
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
            /*
                        console.log("---------------------------------");
                        console.log("| file: " + file);
                        console.log("| rowIndex: " + row.__rowNum__);
                        console.log("| Unknown datatype: " + datatype);
                        console.log("---------------------------------");
                        console.log("\n");
            */
        }
    } else {
        de.valueDomain.datatype = 'Value List';
        de.valueDomain.permissibleValues = [];
        let permissibleValues = getCell(row, 'Permissible Values');
        let permissibleValueDescriptions = getCell(row, 'Permissible Value Descriptions');
        let permissibleValueOutputCodes = getCell(row, 'Permissible Value Output Codes');
        if (permissibleValues && permissibleValueDescriptions && permissibleValueOutputCodes) {
            let pvs = permissibleValues.split(';').filter(t => t);
            let pvDescriptions = permissibleValueDescriptions.split(';').filter(t => t);
            let pvCodes = permissibleValueOutputCodes.split(';').filter(t => t);
            if (pvs.length === pvDescriptions.length && pvDescriptions.length === pvCodes.length && pvs.length === pvCodes.length) {
                for (let i = 0; i < pvs.length; i++) {
                    let pv = {
                        permissibleValue: pvs[i],
                        valueMeaningName: pvs[i],
                        valueMeaningDefinition: pvDescriptions[i],
                        valueMeaningCode: pvCodes[i]
                    };
                    de.valueDomain.permissibleValues.push(pv);
                }
            } else {
                console.log("---------------------------------");
                console.log("| file: " + file);
                console.log("| rowIndex: " + row.__rowNum__);
                console.log("| PV Length mismatch. pv:" + pvs.length + " pvDescriptions:" + pvDescriptions.length + " pvCodes:" + pvCodes.length);
                console.log("---------------------------------");
                console.log("\n");
                throw "bad pvs.";
            }
        }
    }

    let references = getCell(row, 'References');
    if (references && _.findIndex(EXCLUDE_REF_DOC, o => references.indexOf(o) !== -1) === -1) {
        de.referenceDocuments.push({
            document: references
        });
    }
    /*if (references && _.findIndex(EXCLUDE_REF_DOC, o => references.indexOf(o) !== -1) === -1) {
        references.split("-----").forEach(refDocString => {
            let regs = [
                new RegExp(/\s*PMID:\s*(\d*[,|\s]*)*!/g),
                new RegExp(/.*PUBMED:\s*(\d*[,|\s]*)*!/g),
                new RegExp(/\s*PMID:*\s*(\d*[,|;]*)*!/g),
                new RegExp(/\s*PMCID:*\s*(\d*[,|;]*)*!/g),
            ];
            let pmIds = [];
            regs.forEach(reg => {
                let foundRefDoc = refDocString.match(reg);
                if (foundRefDoc && foundRefDoc.length > 0) {
                    pmIds = pmIds.concat(foundRefDoc);
                    refDocString = refDocString.replace(reg, "");
                }
            });
            if (refDocString.length > 0) {
                pmIds.forEach(pmId => {
                    de.referenceDocuments.push({
                        referenceDocumentId: pmId.replace(/;/g, "").trim(),
                        document: refDocString
                    });
                });
                // console.log("reminding ref doc string: " + refDocString);
            }
        });
    }*/

    let keywords = getCell(row, 'Keywords');
    if (keywords) de.properties.push({key: "Keywords", value: keywords});
    let guidelinesInstructions = getCell(row, 'Guidelines/Instructions');
    if (guidelinesInstructions) de.properties.push({key: "Guidelines/Instructions", value: guidelinesInstructions});
    let notes = getCell(row, 'Notes');
    if (notes) de.properties.push({key: "Notes", value: notes});

    /*
        ALL_POSSIBLE_CLASSIFICATIONS.forEach(possibleClassification => {
            if (row[possibleClassification]) {
                let categories = possibleClassification.split(".").concat(row[possibleClassification]);
                classificationShared.classifyElt(de, 'NINDS', ['Preclinical TBI CDE'].concat(categories));
            }
        });

        if (de.classification.length === 0) {
            de.classification = [{
                stewardOrg: {name: 'NINDS'},
                elements: [{
                    name: 'Preclinical TBI',
                    elements: []
                }]
            }];
        }
    */

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
                        if (!de.naming || !de.naming[0].designation) {
                            console.log(file + ' has empty row: ' + rowIndex + '. Variable: ' + getCell(row, 'Variable Name'));
                            rowIndex++;
                            doneOneRow();
                        } else {
                            saveDataElement(de, row, file, (err, newCde) => {
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
                                    let question = deToQuestion(row, newCde);
                                    formElements.push(question);
                                    lastSection = currentSection;
                                    rowIndex++;
                                    doneOneRow();
                                }
                            });
                        }
                    }, () => new FormModel(form).save(err => {
                        if (err) throw err;
                        doneOneFile();
                    }));
                });
            }, () => cb());
        }
    ], () => {
        process.exit(1);
    });
}

run();