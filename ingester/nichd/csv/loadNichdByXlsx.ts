import { isEmpty, trim, groupBy } from 'lodash';
const XLSX = require('xlsx');

import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel } from 'server/form/mongo-form';
import {
    BATCHLOADER, compareElt, findOneCde, mergeClassification, mergeElt, updateCde, updateRawArtifact
} from 'ingester/shared/utility';
import { krabbeDataElementsXlsx } from 'ingester/createMigrationConnection';
import { createNichdForm } from 'ingester/nichd/csv/form/form';
import { createNichdCde } from 'ingester/nichd/csv/cde/cde';

let updatedDeCount = 0;
let newDeCount = 0;
let sameDeCount = 0;

export async function runOneNichdDataElement(nichdRow) {
    const nlmId = trim(nichdRow.shortID);
    const newCdeObj = createNichdCde(nichdRow);
    const newCde = new dataElementModel(newCdeObj);
    if (isEmpty(nlmId) || nlmId === '?') {
        const newCdeSaved: any = await newCde.save().catch((err: any) => {
            console.log(`Not able to save new NICHD cde ${newCde.tinyId} ${err}`);
            process.exit(1);
        });
        newDeCount++;
        console.log(`newDeCount: ${newDeCount} newDe ${newCdeSaved.tinyId}`);
        return newCdeSaved;
    } else {
        const cond = {
            archived: false,
            tinyId: nlmId,
            'registrationState.registrationStatus': {$ne: 'Retired'}
        };
        const existingCdes: any[] = await dataElementModel.find(cond);
        const existingCde: any = findOneCde(existingCdes);
        const diff = compareElt(newCde.toObject(), existingCde.toObject(), 'NICHD');
        if (isEmpty(diff)) {
            mergeClassification(existingCde, newCde, 'NICHD');
            const sameCdeSaved = await existingCde.save().catch((err: any) => {
                console.log(`Not able to save existing NICHD cde ${existingCde.tinyId} ${err}`);
                process.exit(1);
            });
            sameDeCount++;
            console.log(`sameDeCount: ${sameDeCount} sameDe ${sameCdeSaved.tinyId}`);
            return sameCdeSaved;
        } else {
            const existingCdeObj = existingCde.toObject();
            mergeElt(existingCdeObj, newCde, 'NICHD');
            mergeClassification(existingCdeObj, newCde, 'NICHD');
            const updatedCdeSaved: any = await updateCde(existingCdeObj, BATCHLOADER).catch((err: any) => {
                console.log(`Not able to update existing NICHD cde ${existingCde.tinyId} ${err}`);
                process.exit(1);
            });
            updatedDeCount++;
            console.log(`updatedDeCount: ${updatedDeCount} updateCdeSaved ${updatedCdeSaved.tinyId}`);
            return updatedCdeSaved;
        }
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
