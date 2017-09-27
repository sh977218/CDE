const fs = require('fs');
const _ = require('lodash');
const XLSX = require('xlsx');

const DATA_TYPE_MAP = {
    'Alphanumeric': 'Text',
    'Date or Date & Time': 'Date',
    'Numeric Values': 'Number',
    'Numeric': 'Number'
};

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

function rowToDataElement(file, row) {
    let ids = [{
        source: 'NINDS',
        id: row['Variable Name']
    }];
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
//            throw file + " Unknown datatype: " + datatype;
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
            } else throw file + " PV Length mismatch. pv:" + pvs.length + " pvDescs:" + pvDescs.length + " pvCodes:" + pvCodes.length;
        }
    }

    let referenceDocs = [];
    if (row['References'] && _.indexOf(EXCLUDE_REF_DOC, row['References']) === -1) {
        RegExp(/PUBMED:\s*(\d+[,|]*\s*)+/g);
        let pms = row['References'].split(/\s*PMID:*\s*\d+[\.|;]/g);
        console.log('a');
    }
}

function run() {
    let files = fs.readdirSync(FILE_PATH);
    files.forEach(file => {
        let index = _.indexOf(EXCLUDE_FILE, file);
        if (index === -1) {
            let workbook = XLSX.readFile(FILE_PATH + file);
            let sheetName = workbook.SheetNames[0];
            let rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {raw: true});
            let form = {};
            rows.forEach(row => {
                let de = rowToDataElement(file, row);
            });
        }
    });
}


run();