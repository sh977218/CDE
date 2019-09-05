import { readdirSync, readFileSync } from 'fs';
import { generateTinyId } from 'server/system/mongo-data';
import { toLower } from 'lodash';
import { loadFormByCsv } from 'ingester/ninds/Loader/loadNindsByForm';

const csv = require('csv');

const FILE_PATH = 'S:/MLB/CDE/NINDS/Preclinical + NEI';
let formCount = 0;
let deCount = 0;

function getCell(row, header) {
    if (row[header]) {
        return row[header];
    } else {
        const headerLower = toLower(header);
        if (row[headerLower]) {
            return row[headerLower];
        } else {
            return '';
        }
    }
}

function deToQuestion(row, cde) {
    const question = {
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
    if (row['Preferred Question Text']) {
        question.label = row['Preferred Question Text'];
    } else {
        question.label = cde.naming[0].designation;
    }

    if (row['Guidelines/Instructions']) {
        question.instructions.value = row['Guidelines/Instructions'];
    }

    if (row['Input Restriction'].indexOf('Multiple Pre-Defined Values Selected') > -1) {
        question.question.multiselect = true;
    }
    return question;
}

async function rowToDataElement(row, form) {
    const de = {
        tinyId: generateTinyId(),
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

    await parseRefDoc(row, de, form);
    return de;
}


function parseOneCsv(csvFileName) {
    return new Promise(resolve => {
        const csvPath = `${FILE_PATH}/${csvFileName}`;
        const cond = {
            columns: true,
            rtrim: true,
            trim: true,
            relax_column_count: true,
            skip_empty_lines: true,
            skip_lines_with_empty_values: true
        };
        csv.parse(readFileSync(csvPath), cond, async (err, rows) => {
            if (err) {
                console.log(err);
                process.exit(1);
            } else {
                resolve({rows, csvFileName});
            }
        });
    });
}

async function run() {
    const csvFiles = readdirSync(FILE_PATH);
    for (const csvFileName of csvFiles) {
        if (csvFileName.indexOf('.csv') !== -1) {
            const rows = await parseOneCsv(csvFileName);
            await loadFormByCsv(rows);
        }
    }
}


run().then(
    result => {
        console.log(result);
        console.log('Finished all ninds csv.');
        process.exit(0);
    },
    err => {
        console.log(err);
        process.exit(1);
    }
);
