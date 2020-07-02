import { isEmpty, trim, groupBy } from 'lodash';

const XLSX = require('xlsx');

import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel } from 'server/form/mongo-form';
import { formatRows, getCell } from 'ingester/ninds/csv/shared/utility';
import { createNhlbiCde } from 'ingester/ninds/csv/cde/cde';
import { createNhlbiForm } from 'ingester/ninds/csv/form/form';
import {
    BATCHLOADER, compareElt,
    createCde, createForm, findOneCde, findOneForm, imported, lastMigrationScript, mergeClassification, mergeElt,
    updateCde
} from 'ingester/shared/utility';
import {
    krabbeDataElementsXlsx, sickleCellDataElementsXlsx, sickleCellFormMappingXlsx
} from 'ingester/createMigrationConnection';
import { parseNhlbiClassification as parseNhlbiCdeClassification } from 'ingester/ninds/csv/cde/ParseClassification';
import { parseNhlbiDesignations } from 'ingester/ninds/csv/cde/ParseDesignations';
import { createNichdForm } from 'ingester/nichd/csv/form/form';
import { createNichdCde } from 'ingester/nichd/csv/cde/cde';

let existingDeCount = 0;
let newDeCount = 0;
let existingFormCount = 0;
let newFormCount = 0;

function assignNhlbiId(existingCde, row) {
    let nindsIdExist = false;
    const nindsId = getCell(row, 'External ID.NINDS');
    existingCde.ids.forEach(i => {
        if (i.id === nindsId) {
            nindsIdExist = true;
        }
    });
    if (!nindsIdExist) {
        existingCde.ids.push({source: 'NHLBI', id: nindsId});
    }
}

export async function runOneNichdDataElement(nichdRow) {
    const nlmId = nichdRow.shortID;
    const newCdeObj = createNichdCde(nichdRow);
    const newCde = new dataElementModel(newCdeObj);
    if (isEmpty(nlmId)) {
        await newCde.save().catch((err: any) => {
            console.log(`Not able to save cde when save new NICHD cde ${newCde.tinyId} ${err}`);
            process.exit(1);
        });
    } else {
        const cond = {
            archived: false,
            tinyId: nlmId,
            'registrationState.registrationStatus': {$ne: 'Retired'}
        };
        const existingCdes: any[] = await dataElementModel.find(cond);
        const existingCde: any = findOneCde(existingCdes);
        const diff = compareElt(newCde.toObject(), existingCde.toObject(), 'NCI');

        mergeElt(existingCde, newCde, 'NICHD');
        mergeClassification(existingCde, newCde, 'NICHD');
        await updateCde(existingCde, BATCHLOADER);
    }
}


async function runOneNichdForm(nichdFormName, nichdRows) {
    const nichdFormObj = await createNichdForm(nichdFormName, nichdRows);
    const nichdForm = new formModel(nichdFormObj);
    await nichdForm.save();
}

async function run() {
    const workbook = XLSX.readFile(krabbeDataElementsXlsx);
    const nichdRows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const nichdForms = groupBy(nichdRows, 'Project');
    for (const nichdFormName in nichdForms) {
        if (nichdForms.hasOwnProperty(nichdFormName)) {
//            const nichdRows = nichdForms[nichdFormName].filter(n => n['Field Type'] !== 'text');
            const nichdRows = nichdForms[nichdFormName];
            await runOneNichdForm(nichdFormName, nichdRows);
        }
    }
}

run().then(() => {
    console.log('Finished.');
    process.exit(0);
}, err => {
    console.log('Error: ' + err);
    process.exit(1);
});
