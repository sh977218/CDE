import { isEmpty } from 'lodash';

const XLSX = require('xlsx');

import { dataElementModel } from 'server/cde/mongo-cde';
import { findOneCde, imported, lastMigrationScript } from '../../shared/utility';
import { sickleCellDataElementsXlsx } from 'ingester/createMigrationConnection';

import { createNhlbiCde } from 'ingester/ninds/csv/cde/cde';
import { formatRows, getCell } from 'ingester/ninds/csv/shared/utility';
import { parseNhlbiClassification } from 'ingester/ninds/csv/cde/ParseClassification';

function classifyNhlbi(elt, row) {
    const eltObj = elt.toObject();
    parseNhlbiClassification(eltObj, row);
    elt.classification = eltObj.classification;
}

async function doOneNhlbiCde(row) {
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
        const nhlbiCde = await createNhlbiCde(row);
        await new dataElementModel(nhlbiCde).save();
    }
}

async function run() {
    const workbook = XLSX.readFile(sickleCellDataElementsXlsx);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const formattedRows = formatRows('sickleCellDataElementsXlsx', rows);
    for (const row of formattedRows) {
        await doOneNhlbiCde(row);
    }
}

run().then(() => {
    console.log('Finished.');
    process.exit(0);
}, err => {
    console.log('Error: ' + err);
    process.exit(1);
});
