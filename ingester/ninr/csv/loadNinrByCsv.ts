const XLSX = require('xlsx');

import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel, formSourceModel } from 'server/form/mongo-form';
import { BATCHLOADER, findOneCde, imported, lastMigrationScript, sleep, updateCde } from 'ingester/shared/utility';
import { SocialDeterminantsOfHealthCsv } from 'ingester/createMigrationConnection';
import { createNinrForm } from 'ingester/ninr/csv/form/form';
import { createNinrCde, updateNinrRawArtifact } from 'ingester/ninr/csv/cde/cde';
import { formatRows, getCell } from 'ingester/ninds/csv/shared/utility';
import { addNinrClassification } from 'ingester/ninr/csv/cde/ParseClassification';
import { addNinrSource } from 'ingester/ninr/csv/cde/ParseSources';

let updatedDeCount = 0;
let newDeCount = 0;
let sameDeCount = 0;

let newFormCount = 0;

export async function runOneNinrDataElement(ninrCsvRow, source) {
    const variableName = getCell(ninrCsvRow, 'variable name');
    const newCdeObj = await createNinrCde(ninrCsvRow);

    const newCde = new dataElementModel(newCdeObj);
    const cond = {
        archived: false,
        'registrationState.registrationStatus': {$ne: 'Retired'},
        ids: {
            $elemMatch: {
                source: 'BRICS Variable Name',
                id: variableName
            }
        },
    };

    const existingCdes = await dataElementModel.find(cond);
    const existingCde = findOneCde(existingCdes, variableName);
    if (!existingCde) {
        const newCdeSaved = await newCde.save().catch((err: any) => {
            console.log(`Not able to save new NINR cde ${newCde.tinyId} ${err}`);
            process.exit(1);
        });
        newDeCount++;
        console.log(`newDeCount: ${newDeCount} newDe ${newCde.tinyId}`);
        await updateNinrRawArtifact(newCde.tinyId, newCdeObj);
        return newCdeSaved;
    } else {
        const existingCdeObj = existingCde.toObject();
        addNinrClassification(existingCdeObj, newCde.toObject());
        addNinrSource(existingCdeObj, newCde.toObject());
        existingCdeObj.lastMigrationScript = lastMigrationScript;
        existingCdeObj.imported = imported;
        existingCdeObj.changeNote = lastMigrationScript;
        const updatedCdeSaved: any = await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true}).catch((err: any) => {
            console.log(`Not able to update existing NINR cde ${existingCde.tinyId} ${err}`);
            process.exit(1);
        });
        updatedDeCount++;
        console.log(`updatedDeCount: ${updatedDeCount} updateCdeSaved ${existingCde.tinyId}`);
        await updateNinrRawArtifact(existingCdeObj.tinyId, newCdeObj);
        return updatedCdeSaved;
    }
}


async function runOneNinrForm(ninrFormName, ninrRows, source) {
    const ninrFormObj = await createNinrForm(ninrFormName, ninrRows, source, '');
    const ninrForm = await new formModel(ninrFormObj).save();
    newFormCount++;
    console.log(`newFormCount: ${newFormCount} newForm ${ninrForm.tinyId}`);
    await new formSourceModel(ninrFormObj).save();
}

async function run() {
    const workbook = XLSX.readFile(SocialDeterminantsOfHealthCsv, {raw: true});
    const ninrCsvRows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const formattedNinrCsvRows = formatRows('SocialDeterminantsOfHealth_06152020', ninrCsvRows);
    await runOneNinrForm('Social Determinants of Health', formattedNinrCsvRows, 'Social Determinants of Health');
    console.log('Wait 20 seconds for elastic search to catch up.');
    await sleep(20000);
}

run().then(() => {
    console.log('Finished.');
    process.exit(0);
}, err => {
    console.log('Error: ' + err);
    process.exit(1);
});
