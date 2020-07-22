import { isEmpty, trim, groupBy } from 'lodash';

const XLSX = require('xlsx');

import { dataElementModel, dataElementSourceModel } from 'server/cde/mongo-cde';
import { formModel, formSourceModel } from 'server/form/mongo-form';
import {
    BATCHLOADER, findOneCde, imported, lastMigrationScript, mergeClassificationByOrg, updateCde, updateRawArtifact
} from 'ingester/shared/utility';
import { krabbeDataElementsXlsx } from 'ingester/createMigrationConnection';
import { createNichdForm } from 'ingester/nichd/csv/form/form';
import { createNichdCde } from 'ingester/nichd/csv/cde/cde';
import { addNichdIdentifier } from 'ingester/nichd/csv/cde/ParseIds';
import { addNichdDesignation } from 'ingester/nichd/csv/cde/ParseDesignations';
import { addNichdSource } from 'ingester/nichd/csv/cde/ParseSources';

let updatedDeCount = 0;
let newDeCount = 0;
let sameDeCount = 0;

export async function runOneNichdDataElement(nichdRow, source) {
    const nlmId = trim(nichdRow.shortID);
    const newCdeObj = createNichdCde(nichdRow, source);
    const newCde = new dataElementModel(newCdeObj);
    let existingCde: any;
    if (isEmpty(nlmId) || nlmId === '?') {
        existingCde = await newCde.save().catch((err: any) => {
            console.log(`Not able to save new NICHD cde ${newCde.tinyId} ${err}`);
            process.exit(1);
        });
        newDeCount++;
        console.log(`newDeCount: ${newDeCount} newDe ${existingCde.tinyId}`);
        await new dataElementSourceModel(newCdeObj).save();
        return existingCde;
    } else {
        const cond = {
            archived: false,
            tinyId: nlmId,
            'registrationState.registrationStatus': {$ne: 'Retired'}
        };
        const existingCdes: any[] = await dataElementModel.find(cond);
        existingCde = findOneCde(existingCdes);
        const existingCdeObj = existingCde.toObject();
        addNichdDesignation(existingCdeObj, nichdRow);
        addNichdSource(existingCdeObj, source);
        addNichdIdentifier(existingCdeObj, nichdRow);
        mergeClassificationByOrg(existingCdeObj, newCde.toObject(), 'NICHD');
        existingCdeObj.imported = imported;
        existingCdeObj.changeNote = lastMigrationScript;
        if (existingCdeObj.lastMigrationScript === lastMigrationScript) {
            existingCde.designations = existingCdeObj.designations;
            existingCde.ids = existingCdeObj.ids;
            existingCde.sources = existingCdeObj.sources;
            existingCde.classification = existingCdeObj.classification;
            const sameCdeSaved: any = await existingCde.save().catch((err: any) => {
                console.log(`Not able to save same NICHD cde ${newCde.tinyId} ${err}`);
                process.exit(1);
            });
            sameDeCount++;
            console.log(`sameDeCount: ${sameDeCount} sameCdeSaved ${sameCdeSaved.tinyId}`);
            await updateRawArtifact(existingCdeObj, newCde.toObject(), source, 'NICHD');
            return sameCdeSaved;
        } else {
            existingCdeObj.lastMigrationScript = lastMigrationScript;
            const updatedCdeSaved: any = await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true}).catch((err: any) => {
                console.log(`Not able to update existing NICHD cde ${existingCde.tinyId} ${err}`);
                process.exit(1);
            });
            updatedDeCount++;
            console.log(`updatedDeCount: ${updatedDeCount} updateCdeSaved ${updatedCdeSaved.tinyId}`);
            await updateRawArtifact(existingCdeObj, newCde.toObject(), source, 'NICHD');
            return updatedCdeSaved;
        }
    }
}


async function runOneNichdForm(nichdFormName, nichdRows, source) {
    const nichdFormObj = await createNichdForm(nichdFormName, nichdRows, source);
    const nichdForm = new formModel(nichdFormObj);
    await new formSourceModel(nichdForm).save();
}

async function run() {
    const workbook = XLSX.readFile(krabbeDataElementsXlsx);
    const nichdRows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    console.log('NICHD row length: ' + nichdRows.length);
    const nichdForms = groupBy(nichdRows, 'Project');
    for (const nichdFormName in nichdForms) {
        if (nichdForms.hasOwnProperty(nichdFormName)) {
            const nichdRows = nichdForms[nichdFormName];
            await runOneNichdForm(nichdFormName, nichdRows, 'NICHD NBSTRN Krabbe Disease');
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
