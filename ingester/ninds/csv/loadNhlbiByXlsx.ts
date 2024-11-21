import {isEmpty, trim} from 'lodash';
import {dataElementModel} from 'server/cde/mongo-cde';
import {formModel} from 'server/form/mongo-form';
import {formatRows, getCell} from 'ingester/ninds/csv/shared/utility';
import {createNhlbiCde} from 'ingester/ninds/csv/cde/cde';
import {createNhlbiForm} from 'ingester/ninds/csv/form/form';
import {createCde, createForm, findOneCde, findOneForm, imported, lastMigrationScript} from 'ingester/shared/utility';
import {parseNhlbiClassification as parseNhlbiCdeClassification} from 'ingester/ninds/csv/cde/ParseClassification';
import {parseNhlbiClassification as parseNhlbiFormClassification} from 'ingester/ninds/csv/form/ParseClassification';
import {parseNhlbiDesignations} from 'ingester/ninds/csv/cde/ParseDesignations';
import {CdeForm} from 'shared/form/form.model';

const XLSX = require('xlsx');

let existingDeCount = 0;
let newDeCount = 0;
let existingFormCount = 0;
let newFormCount = 0;

function assignNhlbiId(existingCde: CdeForm, row: any) {
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

async function doOneNhlbiCde(row: any, formMap: any) {
    const variableName = getCell(row, 'Name');
    const cond = {
        archived: false,
        'ids.id': variableName,
        'registrationState.registrationStatus': {$ne: 'Retired'}
    };
    const existingCdes: any[] = await dataElementModel.find(cond);
    const existingCde: any = findOneCde(existingCdes);
    const nhlbiCde = await createNhlbiCde(row, formMap);
    if (existingCde) {
        // store form question info into formMap
        parseNhlbiDesignations(row, formMap);
        const existingCdeObj = existingCde.toObject();
        parseNhlbiCdeClassification(existingCdeObj, row);
        existingCde.classification = existingCdeObj.classification;

        existingCde.lastMigrationScript = lastMigrationScript;
        existingCde.imported = imported;

        if (existingCde.valueDomain.datatype !== nhlbiCde.valueDomain.datatype) {
            const variableName = getCell(row, 'Name');
            console.log('Error: Data type mismatch. ' + variableName);
        }

        // NHLBI NINDS ID might not correct NINDS ID, we put NHLBI id if it's different.
        assignNhlbiId(existingCde, row);
        await existingCde.save();
        existingDeCount++;
        console.log(`existingDeCount: ${existingDeCount}`);
    } else {
        await createCde(nhlbiCde);
        newDeCount++;
        console.log(`newDeCount: ${newDeCount}`);
    }
}

async function runDataElement(formMap: any) {
    const workbook = XLSX.readFile(sickleCellDataElementsXlsx);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const formattedRows = formatRows('sickleCellDataElementsXlsx', rows);
    for (const row of formattedRows) {
        await doOneNhlbiCde(row, formMap);
    }
}

async function runOneNhlbiForm(row: any, nhlbiCdes: any[]) {
    const nlmId = trim(row['NLM ID']);
    const formId = trim(row.CrfId);
    if (!isEmpty(nlmId) && nlmId[0] !== '—') {
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
                console.log(`Map PhenX ${phenxProtocolId} to NINDS ${crfId}`);
            } else {
                existingFormObj.ids.push({source: 'NHLBI', id: formId});
                console.log(`Assign NHLBI ${formId}`);
            }
            existingForm.ids = existingFormObj.ids;

            await existingForm.save();
            existingFormCount++;
            console.log(`existingFormCount: ${existingFormCount}`);
        } else {
            console.log(`${nlmId} nlmId not found.`);
            process.exit(1);
        }
    } else {
        const nhlbiForm = await createNhlbiForm(row, nhlbiCdes);
        await createForm(nhlbiForm);
        newFormCount++;
        console.log(`newFormCount: ${newFormCount}`);
    }
}

async function runForm(formMap: any) {
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
