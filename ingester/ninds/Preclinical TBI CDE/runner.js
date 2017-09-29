const fs = require('fs');
const util = require('util');
const async = require('async');
const _ = require('lodash');
const XLSX = require('xlsx');

const DataElementModel = require('../../../modules/cde/node-js/mongo-cde').DataElement;
const FormModel = require('../../../modules/form/node-js/mongo-form').Form;
const classificationShared = require('../../../modules/system/shared/classificationShared');

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
    "domain.Duchenne muscular dystrophy/Becker muscular dystrophy", "domain.congenital muscular dystrophy",
    "domain.spinal cord injury",
    "domain.headache",
    "domain.epilepsy",
    "classification.general (for all diseases)",
    "classification.acute hospitalized",
    "classification.concussion/mild TBI",
    "classification.epidemiology",
    "classification.moderate/severe TBI: rehabilitation", "classification.Parkinson's disease",
    "classification.Friedreich's ataxia",
    "classification.stroke",
    "classification.amyotrophic lateral sclerosis",
    "classification.Huntington's disease",
    "classification.multiple sclerosis",
    "classification.neuromuscular diseases",
    "classification.myasthenia gravis",
    "classification.spinal muscular atrophy",
    "classification.Duchenne muscular dystrophy/Becker muscular dystrophy",
    "classification.congenital muscular dystrophy", "classification.spinal cord injury",
    "classification.headache	classification.epilepsy",
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

    let pvs = row['Permissible Values'].split(';');
    let pvDescs = row['Permissible Value Descriptions'].split(';');
    let pvCodes = row['Permissible Value Output Codes'].split(';');
    for (let i = 0; i < pvs.length; i++) {
        let pv = {
            permissibleValue: pvs[i],
            valueMeaningDefinition: pvDescs[i],
            valueMeaningCode: pvCodes[i]
        };
        question.answers.push(pv);
    }
    return question;
}

function rowToDataElement(file, row) {
    let de = {
        stewardOrg: {
            name: 'NINDS'
        },
        createdBy: {
            username: 'batchloader'
        },
        registrationState: {
            registrationStatus: 'Qualified'
        },
        classification: []
    };
    let ids = [{
        source: 'NINDS',
        id: row['Variable Name']
    }];
    de.ids = ids;
    let shortDescription = row['Short Description'];
    let description = row['Definition'];
    let naming = [];
    if (shortDescription === description) {
        naming.push({
            designation: row['Title'],
            definition: description
        });
    } else {
        naming.push({
            designation: row['Title'],
            definition: shortDescription
        });
        naming.push({
            designation: '',
            definition: description
        });
    }
    if (row['Preferred Question Text']) {
        naming.push({
            designation: row['Preferred Question Text'],
            tags: ['Preferred Question Text']
        });
    }
    de.naming = naming;

    let valueDomain = {};
    if (row['Unit of Measure'])
        valueDomain.uom = row['Unit of Measure'];
    if (row['Input Restriction'] === 'Free-Form Entry') {
        let datatype = DATA_TYPE_MAP[row['Datatype']];
        if (datatype === 'Text') {
            valueDomain.datatype = 'Text';
            valueDomain.datatypeText = {};
            if (row['Maximum Character Quantity'])
                valueDomain.datatypeText.maxLength = row['Maximum Character Quantity'];
        } else if (datatype === 'Number') {
            valueDomain.datatype = 'Number';
            valueDomain.datatypeNumber = {};
            if (row['Minimum Value'])
                valueDomain.datatypeNumber.minValue = Number.parseInt(row['Minimum Value']);
            if (row['Maximum Value'])
                valueDomain.datatypeNumber.maxValue = Number.parseInt(row['Maximum Value']);
        } else if (datatype === 'Date') {
            valueDomain.datatypeDate = {};
        } else {
            valueDomain.datatype = 'Text';
            valueDomain.datatypeText = {};
            console.log("---------------------------------");
            console.log("| file: " + file);
            console.log("| row: " + row);
            console.log("| Unknown datatype: " + datatype);
            console.log("---------------------------------");
            console.log("\n\n\n");
        }
    } else {
        valueDomain.datatype = 'Value List';
        valueDomain.permissibleValues = [];
        if (row['Permissible Values'] && row['Permissible Value Descriptions'] && row['Permissible Value Output Codes']) {
            let pvs = row['Permissible Values'].split(';');
            let pvDescs = row['Permissible Value Descriptions'].split(';');
            let pvCodes = row['Permissible Value Output Codes'].split(';');
            if (pvs.length === pvDescs.length && pvDescs.length === pvCodes.length && pvs.length === pvCodes.length) {
                for (let i = 0; i < pvs.length; i++) {
                    let pv = {
                        permissibleValue: pvs[i],
                        valueMeaningDefinition: pvDescs[i],
                        valueMeaningCode: pvCodes[i]
                    };
                    valueDomain.permissibleValues.push(pv);
                }
            } else {
                console.log("---------------------------------");
                console.log("| file: " + file);
                console.log("| row: " + row);
                console.log("| PV Length mismatch. pv:" + pvs.length + " pvDescs:" + pvDescs.length + " pvCodes:" + pvCodes.length);
                console.log("---------------------------------");
                console.log("\n\n\n");
            }
        }
    }
    de.valueDomain = valueDomain;

    let referenceDocuments = [];
    if (row['References'] && _.indexOf(EXCLUDE_REF_DOC, row['References']) === -1) {
        RegExp(/PUBMED:\s*(\d+[,|]*\s*)+/g);
        let pms = row['References'].split(/\s*PMID:*\s*\d+[\.|;]/g);
    }
    de.referenceDocuments = referenceDocuments;

    let properties = [];
    if (row['keywords']) properties.push({key: "keywords", value: row['keywords']});
    if (row['guidelines/instructions']) properties.push({
        key: "guidelines/instructions",
        value: row['guidelines/instructions']
    });
    if (row['notes']) properties.push({key: "notes", value: row['notes']});
    if (row['keywords']) properties.push({key: "KeyWord", value: row['keywords']});
    de.properties = properties;

    ALL_POSSIBLE_CLASSIFICATIONS.forEach(possibleClassification => {
        if (row[possibleClassification]) {
            let categories = possibleClassification.split(".").reverse().concat(row[possibleClassification]);
            classificationShared.classifyElt(de, 'NINDS', categories);
        }
    });
    return de;
}

function run() {
    let files = fs.readdirSync(FILE_PATH);
    files.forEach(file => {
        let index = _.indexOf(EXCLUDE_FILE, file);
        if (index === -1) {
            let workbook = XLSX.readFile(FILE_PATH + file);
            let sheetName = workbook.SheetNames[0];
            let rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {raw: true});
            let form = {
                naming: [
                    {designation: _.words('sheetName').join(" ")}
                ],
                formElements: []
            };
            async.forEach(rows, (row, doneOneRow) => {
                let de = rowToDataElement(file, row);
                new DataElementModel(de).save((err, newCde) => {
                    if (err) throw err;
                    let question = deToQuestion(row, newCde);
                    form.formElements.push(question);
                    doneOneRow();
                });
            }, () => new FormModel(form).save(err => {
                if (err) throw err;
            }));
        }
    });
}


run();