const XLSX = require('xlsx');

import { dataElementModel } from 'server/cde/mongo-cde';
import { findOneCde, imported, lastMigrationScript } from 'ingester/shared/utility';
import { sickleCellDataElementsXlsx, sickleCellFormMappingXlsx } from 'ingester/createMigrationConnection';

import { createNhlbiCde } from 'ingester/ninds/csv/cde/cde';
import { formatRows, getCell } from 'ingester/ninds/csv/shared/utility';
import { parseNhlbiClassification } from 'ingester/ninds/csv/cde/ParseClassification';

function classifyNhlbi(elt, row) {
    const eltObj = elt.toObject();
    parseNhlbiClassification(eltObj, row);
    elt.classification = eltObj.classification;
}

async function doOneNhlbiCde(row, formMap) {
    const id = getCell(row, 'External ID.NINDS');
    const cond = {
        archived: false,
        'ids.id': id,
        'registrationState.registrationStatus': {$ne: 'Retired'}
    };
    const existingCdes: any[] = await dataElementModel.find(cond);
    const existingCde: any = findOneCde(existingCdes);
    if (existingCde) {
        classifyNhlbi(existingCde, row);
        existingCde.lastMigrationScript = lastMigrationScript;
        existingCde.imported = imported;
        await existingCde.save();
    } else {
        const nhlbiCde = await createNhlbiCde(row, formMap);
        await new dataElementModel(nhlbiCde).save();
    }
}

async function runDataElement(formMap) {
    const workbook = XLSX.readFile(sickleCellDataElementsXlsx);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const formattedRows = formatRows('sickleCellDataElementsXlsx', rows);
    for (const row of formattedRows) {
        await doOneNhlbiCde(row, formMap);
    }
}

async function runForm() {
    const workbook = XLSX.readFile(sickleCellFormMappingXlsx);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const formattedRows = formatRows('sickleCellDataElementsXlsx', rows);
    for (const row of formattedRows) {
    }
}

const formMap = new Set();

async function run() {
    await runDataElement(formMap);
    console.log(formMap);
    console.log('a');
//    await runForm();

}

run().then(() => {
    console.log('Finished.');
    process.exit(0);
}, err => {
    console.log('Error: ' + err);
    process.exit(1);
});
