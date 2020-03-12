import { isEmpty, trim } from 'lodash';

const XLSX = require('xlsx');

import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel } from 'server/form/mongo-form';
import { formatRows, getCell } from 'ingester/ninds/csv/shared/utility';
import { createNhlbiCde } from 'ingester/ninds/csv/cde/cde';
import { createNhlbiForm } from 'ingester/ninds/csv/form/form';
import { findOneCde, findOneForm, imported, lastMigrationScript } from 'ingester/shared/utility';
import { sickleCellDataElementsXlsx, sickleCellFormMappingXlsx } from 'ingester/createMigrationConnection';
import { parseNhlbiClassification as parseNhlbiCdeClassification } from 'ingester/ninds/csv/cde/ParseClassification';
import { parseNhlbiClassification as parseNhlbiFormClassification } from 'ingester/ninds/csv/form/ParseClassification';

let existingDeCount = 0;
let newDeCount = 0;
let existingFormCount = 0;
let newFormCount = 0;

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
        const existingCdeObj = existingCde.toObject();
        parseNhlbiCdeClassification(existingCdeObj, row);
        existingCde.classification = existingCdeObj.classification;

        existingCde.lastMigrationScript = lastMigrationScript;
        existingCde.imported = imported;
        await existingCde.save();
        existingDeCount++;
        console.log(`existingDeCount: ${existingDeCount}`);
    } else {
        const nhlbiCde = await createNhlbiCde(row, formMap);
        await new dataElementModel(nhlbiCde).save();
        newDeCount++;
        console.log(`newDeCount: ${newDeCount}`);
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

async function runOneNhlbiForm(row, nhlbiCdes) {
    const nlmId = trim(row['NLM ID']);
    if (!isEmpty(nlmId) && nlmId !== '—') {
        const cond = {
            archived: false,
            tinyId: nlmId,
            'registrationState.registrationStatus': {$ne: 'Retired'}
        };
        const existingForms: any[] = await formModel.find(cond);
        const existingForm: any = findOneForm(existingForms);
        if (existingForm) {
            const existingFormObj = existingForm.toObject();
            parseNhlbiFormClassification(existingFormObj);
            existingForm.classification = existingFormObj.classification;

            const phenxProtocolId = row['PhenX Protocol'];
            const crfId = row.CrfId;
            if (!isEmpty(phenxProtocolId) && !isEmpty(crfId)) {
                existingFormObj.ids.push({source: 'NINDS', id: trim(crfId)});
                existingForm.ids = existingFormObj.ids;
            }

            await existingForm.save();
            existingFormCount++;
            console.log(`existingFormCount: ${existingFormCount}`);
        } else {
            console.log(`${nlmId} nlmId not found.`);
            process.exit(1);
        }
    } else {
        const nhlbiForm = await createNhlbiForm(row, nhlbiCdes);
        await new formModel(nhlbiForm).save();
        newFormCount++;
        console.log(`newFormCount: ${newFormCount}`);
    }
}

async function runForm(formMap) {
    const workbook = XLSX.readFile(sickleCellFormMappingXlsx);
    const phenxCrfs = XLSX.utils.sheet_to_json(workbook.Sheets['PhenX CRFs']);
    const nonPhenxCrfs = XLSX.utils.sheet_to_json(workbook.Sheets['Non-PhenX CRFs']);
    const formattedRows = phenxCrfs.concat(nonPhenxCrfs);
    for (const row of formattedRows) {
        const formId = row.CrfId;
        await runOneNhlbiForm(row, formMap[formId]);
    }
}

const formMap = {};

async function run() {
    await runDataElement(formMap);
    console.log('Finished data elements.');
    await runForm(formMap);
    console.log('Finished forms.');
}

run().then(() => {
    console.log('Finished.');
    process.exit(0);
}, err => {
    console.log('Error: ' + err);
    process.exit(1);
});
