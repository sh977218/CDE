import {readdirSync} from 'fs';
import {groupBy, sortBy} from 'lodash';
import {
    BATCHLOADER,
    imported,
    mergeElt,
    NINDS_PRECLINICAL_NEI_FILE_PATH,
    updateCde,
    updateForm,
} from 'ingester/shared/utility';
import {createNindsCde} from 'ingester/ninds/csv/cde/cde';
import {dataElementModel} from 'server/cde/mongo-cde';
import {formModel} from 'server/form/mongo-form';
import {loadFormByCsv} from 'ingester/ninds/csv/loadNindsFormByCsv';
import {loadNindsCde} from 'ingester/ninds/shared';
import {parseOneCsv} from 'ingester/ninds/csv/shared/utility';

async function loadNindsCdes(folder: string) {
    const csvFiles = readdirSync(folder);
    const csvFileNames: string[] = sortBy(csvFiles);
    let cdeRows: any[] = [];
    for (const csvFileName of csvFileNames) {
        const csvPath = `${NINDS_PRECLINICAL_NEI_FILE_PATH}/${csvFileName}`;
        const csvResult = await parseOneCsv(csvPath, csvFileName);
        cdeRows = cdeRows.concat(csvResult.rows);
    }
    const result = groupBy(cdeRows, 'variable name');
    for (const variableName in result) {
        if (result.hasOwnProperty(variableName)) {
            const rows = result[variableName];
            const cde = await createNindsCde(rows[0]);
            for (const row of rows) {
                const newCde = await createNindsCde(row);
                mergeElt(cde, newCde, 'NINDS Preclinical TBI');
            }
            const cond = {
                archived: false,
                $elemMatch: {
                    source: 'BRICS Variable Name',
                    id: variableName
                }
            };
            await loadNindsCde(cde, cond, 'NINDS Preclinical TBI');
        }
    }
}

async function loadNindsForms(folder: string) {
    const csvFiles = readdirSync(folder);
    const csvFileNames: string[] = sortBy(csvFiles);
    for (const csvFileName of csvFileNames) {
        const csvPath = `${NINDS_PRECLINICAL_NEI_FILE_PATH}/${csvFileName}`;
        const rows = await parseOneCsv(csvPath, csvFileName);
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
    await loadNindsCdes(NINDS_PRECLINICAL_NEI_FILE_PATH);
    await loadNindsForms(NINDS_PRECLINICAL_NEI_FILE_PATH);
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
