import { readdirSync, readFileSync } from 'fs';
import { sortBy, groupBy, isEmpty } from 'lodash';
import { loadFormByCsv } from 'ingester/ninds/Loader/loadNindsForm';
import {
    changeNindsPreclinicalNeiClassification, fixDefinitions, fixReferenceDocuments, formatRows
} from 'ingester/ninds/csv/shared/utility';
import {
    BATCHLOADER, compareElt, findOneCde, imported, lastMigrationScript, mergeElt, NINDS_PRECLINICAL_NEI_FILE_PATH,
    updateCde, updateForm,
    updateRowArtifact
} from 'ingester/shared/utility';
import { createNindsCde } from 'ingester/ninds/csv/cde/cde';
import { dataElementModel } from 'server/cde/mongo-cde';
import { formModel } from 'server/form/mongo-form';

const CSV = require('csv');

function parseOneCsv(csvFileName: string): Promise<any> {
    return new Promise(resolve => {
        const csvPath = `${NINDS_PRECLINICAL_NEI_FILE_PATH}/${csvFileName}`;
        const cond = {
            columns: true,
            rtrim: true,
            trim: true,
            relax_column_count: true,
            skip_empty_lines: true,
            skip_lines_with_empty_values: true
        };
        CSV.parse(readFileSync(csvPath), cond, (err: any, data: any[]) => {
            if (err) {
                console.log(err);
                process.exit(1);
            } else {
                const rows = formatRows(csvFileName, data);
                resolve({rows, csvFileName});
            }
        });
    });
}

async function fixCde(existingCde: any) {
    fixDefinitions(existingCde);
    fixReferenceDocuments(existingCde);

    const savedCde = await existingCde.save().catch((err: any) => {
        console.log(`Not able to save form when fixCde ${existingCde.tinyId} ${err}`);
        process.exit(1);
    });
    return savedCde;
}

async function doOneRow(nindsCde: any, variableName: string) {
    const newCde = new dataElementModel(nindsCde);
    const newCdeObj = newCde.toObject();
    const cond = {
        archived: false,
        'ids.id': variableName
    };
    const existingCdes: any[] = await dataElementModel.find(cond);
    let existingCde: any = findOneCde(existingCdes);
    if (!existingCde) {
        existingCde = await newCde.save().catch((err: any) => {
            console.log(`Not able to save form when save new NINDS cde ${newCde.tinyId} ${err}`);
            process.exit(1);
        });
        console.log(`created cde tinyId: ${existingCde.tinyId}`);
    } else {
        // @TODO remove after load
        existingCde = await fixCde(existingCde);

        const diff = compareElt(newCde.toObject(), existingCde.toObject(), 'NINDS Preclinical NEI');
        changeNindsPreclinicalNeiClassification(existingCde, newCde.toObject(), 'NINDS');

        if (isEmpty(diff)) {
            existingCde.lastMigrationScript = lastMigrationScript;
            existingCde.imported = imported;
            existingCde = await existingCde.save().catch((err: any) => {
                console.log(`Not able to save form when save existing NINDS cde ${existingCde.tinyId} ${err}`);
                process.exit(1);
            });
            console.log(`same cde tinyId: ${existingCde.tinyId}`);
        } else {
            const existingCdeObj = existingCde.toObject();
            mergeElt(existingCdeObj, newCdeObj, 'NINDS Preclinical NEI', 'NINDS');
            await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true});
            console.log(`updated cde tinyId: ${existingCde.tinyId}`);
        }
    }
    await updateRowArtifact(existingCde, newCdeObj, 'NINDS Preclinical NEI', 'NINDS');

    const savedCde: any = await dataElementModel.findOne({archived: false, 'ids.id': variableName});
    return savedCde;
}

async function loadNindsCde(variablename: string, rows: any[]) {
    const cde = await createNindsCde(rows[0]);
    for (const row of rows) {
        const newCde = await createNindsCde(row);
        mergeElt(cde, newCde, 'NINDS Preclinical NEI', 'NINDS');
    }
    await doOneRow(cde, variablename);
}

async function preLoadNindsCdes(cdeRows: any[]) {
    const result = groupBy(cdeRows, 'variable name');
    for (const variablename in result) {
        if (result.hasOwnProperty(variablename)) {
            await loadNindsCde(variablename, result[variablename]);
        }
    }
}

async function run() {
    const csvFiles = readdirSync(NINDS_PRECLINICAL_NEI_FILE_PATH);
    const csvFileNames: string[] = sortBy(csvFiles);
    let cdeRows: any[] = [];
    for (const csvFileName of csvFileNames) {
        const csvResult = await parseOneCsv(csvFileName);
        cdeRows = cdeRows.concat(csvResult.rows);
    }
    await preLoadNindsCdes(cdeRows);

    for (const csvFileName of csvFileNames) {
//    for (const csvFileName of ['GripStrength_061217.csv']) {
        const csvResult = await parseOneCsv(csvFileName);
        console.log(`Starting csvFileName: ${csvFileName}.`);
        await loadFormByCsv(csvResult);
        console.log(`Finished csvFileName: ${csvFileName}`);
    }

    await retireTbiCdes();
    await retireTbiForms();

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
