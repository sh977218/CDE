import { readdirSync } from 'fs';
import { sortBy, groupBy } from 'lodash';
import {
    BATCHLOADER, imported, mergeElt, NINDS_PRECLINICAL_NEI_FILE_PATH, updateCde, updateForm,
} from 'ingester/shared/utility';
import { createNindsCde } from 'ingester/ninds/csv/cde/cde';
import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel } from 'server/form/mongo-form';
import { loadFormByCsv } from 'ingester/ninds/csv/loadNindsFormByCsv';
import { loadNindsCde } from 'ingester/ninds/shared';
import { parseOneCsv } from 'ingester/ninds/csv/shared/utility';

async function loadNindsCdes() {
    const csvFiles = readdirSync(NINDS_PRECLINICAL_NEI_FILE_PATH);
    const csvFileNames: string[] = sortBy(csvFiles);
    let cdeRows: any[] = [];
    for (const csvFileName of csvFileNames) {
        const csvResult = await parseOneCsv(csvFileName);
        cdeRows = cdeRows.concat(csvResult.rows);
    }
    const result = groupBy(cdeRows, 'variable name');
    for (const variablename in result) {
        if (result.hasOwnProperty(variablename)) {
            const rows = result[variablename];
            const cde = await createNindsCde(rows[0]);
            for (const row of rows) {
                const newCde = await createNindsCde(row);
                mergeElt(cde, newCde, 'NINDS Preclinical TBI');
            }
            const cond = {
                archived: false,
                'ids.id': variablename
            };
            await loadNindsCde(cde, cond, 'NINDS Preclinical TBI');
        }
    }
}

async function loadNindsForms() {
    const csvFiles = readdirSync(NINDS_PRECLINICAL_NEI_FILE_PATH);
    const csvFileNames: string[] = sortBy(csvFiles);
    for (const csvFileName of csvFileNames) {
        const rows = await parseOneCsv(csvFileName);
        console.log(`Starting csvFileName: ${csvFileName}.`);
        await loadFormByCsv(csvFileName, rows);
        console.log(`Finished csvFileName: ${csvFileName}`);
    }
}

async function retireTbiCdes() {
    const cdesToRetire = await dataElementModel.find({
        archived: false, 'classification.elements.name': 'Preclinical TBI',
        'registrationState.registrationStatus': {$ne: 'Retired'}
    });
    for (const cdeToRetire of cdesToRetire) {
        const cdeObj = cdeToRetire.toObject();
        cdeObj.registrationState.registrationStatus = 'Retired';
        cdeObj.registrationState.administrativeNote = 'Not present in import at ' + imported;
        await updateCde(cdeObj, BATCHLOADER);
    }
}

async function retireTbiForms() {
    const formsToRetire = await formModel.find({
        archived: false, 'classification.elements.name': 'Preclinical TBI',
        'registrationState.registrationStatus': {$ne: 'Retired'}
    });
    for (const formToRetire of formsToRetire) {
        const formObj = formToRetire.toObject();
        formObj.registrationState.registrationStatus = 'Retired';
        formObj.registrationState.administrativeNote = 'Not present in import at ' + imported;
        await updateForm(formObj, BATCHLOADER);
    }
}


async function run() {
    await loadNindsCdes();
    await loadNindsForms();
    await retireTbiCdes();
    await retireTbiForms();
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
