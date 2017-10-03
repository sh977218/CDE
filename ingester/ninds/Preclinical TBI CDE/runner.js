const fs = require('fs');
const util = require('util');
const async = require('async');
const _ = require('lodash');
const XLSX = require('xlsx');

const DataElementModel = require('../../../modules/cde/node-js/mongo-cde').DataElement;
const FormModel = require('../../../modules/form/node-js/mongo-form').Form;
const classificationShared = require('../../../modules/system/shared/classificationShared');
const mongo_data = require('../../../modules/system/node-js/mongo-data');

const DATA_TYPE_MAP = {
    'Alphanumeric': 'Text',
    'Date or Date & Time': 'Date',
    'Numeric Values': 'Number',
    'Numeric': 'Number'
};
const ALL_POSSIBLE_CLASSIFICATIONS = [
    "population.all",
    "domain.general (for all diseases)",
    "domain.traumatic brain injury",
    "domain.Parkinson's disease",
    "domain.Friedreich's ataxia",
    "domain.stroke",
    "domain.amyotrophic lateral sclerosis",
    "domain.Huntington's disease",
    "domain.multiple sclerosis",
    "domain.neuromuscular diseases",
    "domain.myasthenia gravis",
    "domain.spinal muscular atrophy",
    "domain.Duchenne muscular dystrophy/Becker muscular dystrophy",
    "domain.congenital muscular dystrophy",
    "domain.spinal cord injury",
    "domain.headache",
    "domain.epilepsy",
    "classification.general (for all diseases)",
    "classification.acute hospitalized",
    "classification.concussion/mild TBI",
    "classification.epidemiology",
    "classification.moderate/severe TBI: rehabilitation",
    "classification.Parkinson's disease",
    "classification.Friedreich's ataxia",
    "classification.stroke",
    "classification.amyotrophic lateral sclerosis",
    "classification.Huntington's disease",
    "classification.multiple sclerosis",
    "classification.neuromuscular diseases",
    "classification.myasthenia gravis",
    "classification.spinal muscular atrophy",
    "classification.Duchenne muscular dystrophy/Becker muscular dystrophy",
    "classification.congenital muscular dystrophy",
    "classification.spinal cord injury",
    "classification.headache",
    "classification.epilepsy",
];

const FILE_PATH = 'S:/MLB/CDE/NINDS/Preclinical TBI CDE/';
const EXCLUDE_FILE = [
    '01_Public_Review_Instructions_PreclinicalTBI.pdf',
    '02_CDE_SpreadsheetGuide_PreclinicalTBI.xlsx',
    '03_Quick_Start_Guide_PreclinicalTBI.pdf',
    '05_Public_Review_Comments_Form_PreclinicalTBI.xlsx',
];
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
        else console.log("No " + header + " found");
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

    if (row['guidelines/instructions'])
        question.instructions.value = row['guidelines/instructions'];

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
    return question;
}

function rowToDataElement(file, row, rowIndex) {
    let de = {
        tinyId: mongo_data.generateTinyId(),
        stewardOrg: {
            name: 'NINDS'
        },
        createdBy: {
            username: 'batchloader'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        referenceDocuments: [],
        properties: [],
        valueDomain: {},
        classification: []
    };
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
            console.log("---------------------------------");
            console.log("| file: " + file);
            console.log("| rowIndex: " + rowIndex);
            console.log("| Unknown datatype: " + datatype);
            console.log("---------------------------------");
            console.log("\n");
        }
    } else {
        de.valueDomain.datatype = 'Value List';
        de.valueDomain.permissibleValues = [];
        let permissibleValues = getCell(row, 'Permissible Values');
        let permissibleValueDescriptions = getCell(row, 'Permissible Value Descriptions');
        let permissibleValueOutputCodes = getCell(row, 'Permissible Value Output Codes');
        if (permissibleValues && permissibleValueDescriptions && permissibleValueOutputCodes) {
            let pvs = permissibleValues.split(';');
            let pvDescs = permissibleValueDescriptions.split(';');
            let pvCodes = permissibleValueOutputCodes.split(';');
            if (pvs.length === pvDescs.length && pvDescs.length === pvCodes.length && pvs.length === pvCodes.length) {
                for (let i = 0; i < pvs.length; i++) {
                    let pv = {
                        permissibleValue: pvs[i],
                        valueMeaningDefinition: pvDescs[i],
                        valueMeaningCode: pvCodes[i]
                    };
                    de.valueDomain.permissibleValues.push(pv);
                }
            } else {
                console.log("---------------------------------");
                console.log("| file: " + file);
                console.log("| rowIndex: " + rowIndex);
                console.log("| PV Length mismatch. pv:" + pvs.length + " pvDescs:" + pvDescs.length + " pvCodes:" + pvCodes.length);
                console.log("---------------------------------");
                console.log("\n");
            }
        }
    }

    let references = getCell(row, 'References');
    if (references && _.findIndex(EXCLUDE_REF_DOC, o => references.indexOf(o) !== -1) === -1) {
        let refDocString = references;
        let sections = refDocString.split("-----");
        if (sections.length > 1) {
            de.referenceDocuments = sections.map(s => {
                return {document: s};
            });
        } else {
            let regs = [
                new RegExp(/\s*PMID:\s*(\d*[,|\s]*)*/g),
                new RegExp(/.*PUBMED:\s*(\d*[,|\s]*)*/g),
                new RegExp(/\s*PMID:*\s*(\d*[,|;]*)*/g),

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
                console.log("reminding ref doc string: " + refDocString);
            }
        }
    }

    let keywords = getCell(row, 'keywords');
    if (keywords) de.properties.push({key: "keywords", value: keywords});
    let guidelinesInstructions = getCell(row, 'guidelines/instructions');
    if (guidelinesInstructions) de.properties.push({key: "guidelines/instructions", value: guidelinesInstructions});
    let notes = getCell(row, 'notes');
    if (notes) de.properties.push({key: "notes", value: notes});

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
                name: 'test',
                elements: []
            }]
        }];
    }

    return de;
}

function run() {
    let files = fs.readdirSync(FILE_PATH).filter(f => _.indexOf(EXCLUDE_FILE, f) === -1);
    async.forEachSeries(files, (file, doneOneFile) => {
        let workbook = XLSX.readFile(FILE_PATH + file);
        let sheetName = workbook.SheetNames[0];
        let rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {raw: true});
        let form = {
            tinyId: mongo_data.generateTinyId(),
            naming: [
                {designation: _.words('sheetName').join(" ")}
            ],
            formElements: []
        };
        let rowIndex = 0;
        async.forEachSeries(rows, (row, doneOneRow) => {
            let de = rowToDataElement(file, row, rowIndex);
            let deObj = new DataElementModel(de);
            deObj.save((err, newCde) => {
                if (err) throw err;
                let question = deToQuestion(row, newCde);
                form.formElements.push(question);
                rowIndex++;
                doneOneRow();
            });
        }, () => new FormModel(form).save(err => {
            if (err) throw err;
            doneOneFile();
        }));
    }, () => process.exit(1));
}


run();