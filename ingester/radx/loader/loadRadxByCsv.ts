const XLSX = require('xlsx');

import { dataElementModel } from 'server/cde/mongo-cde';
import { radxExecutiveCommittee } from 'ingester/createMigrationConnection';
import { mergeDefinitions, mergeDesignations, DEFAULT_RADX_CONFIG } from 'ingester/radx/shared/utility';
import { formatRows, getCell } from 'shared/loader/utilities/utility';
import { createForm } from 'ingester/radx/form/form';
import { createCde } from 'ingester/radx/cde/cde';
import { findOneCde, updateRawArtifact, updateCde, lastMigrationScript, imported, BATCHLOADER } from 'ingester/shared/utility';
import { parseClassification } from 'ingester/radx/cde/ParseClassification';
import { formModel } from 'server/form/mongo-form';




const formCount = 0;
const existingFormCount = 0;
let newFormCount = 0;

const deCount = 0;
let existingDeCount = 0;
let newDeCount = 0;


async function doOneCde(row: any, formMap: any) {
    let logOutput = '';
    const cdeType = getCell(row,'CDE Type');
    if(cdeType === 'Individual CDE' || cdeType === 'Bundle'){

        const nlmId = getCell(row, 'NLM identifier for CDE-R interoperability');
        const cond = {
            archived: false,
            tinyId: nlmId,
            'registrationState.registrationStatus': {$ne: 'Retired'}
        };

        const existingCdes: any[] = await dataElementModel.find(cond);
        let existingCde: any = findOneCde(existingCdes);
        const radxCde = await createCde(row);
        const newCde = new dataElementModel(radxCde);
        const newCdeObj = newCde.toObject();

        if(existingCde){
            console.log(`CDE already exists with NLM ID: ${nlmId}`);
            logOutput += `CDE already exists with NLM ID: ${nlmId}\n`;
            let existingCdeObj = existingCde.toObject();
            parseClassification(existingCdeObj, row);
            existingCde.classification = existingCdeObj.classification;
            existingCde.lastMigrationScript = lastMigrationScript;
            existingCde.imported = imported;
            existingCde.changeNote = lastMigrationScript;
            mergeDefinitions(existingCdeObj, newCdeObj);
            existingCde.definitions = existingCdeObj.definitions;
            mergeDesignations(existingCdeObj, newCdeObj);
            existingCde.designations = existingCdeObj.designations;
            existingCde.sources = [...existingCde.sources, ...radxCde.sources];

            if (existingCde.valueDomain.datatype !== radxCde.valueDomain.datatype) {
                const variableName = getCell(row, 'Data Element Name');
                console.log('Error: Data type mismatch. ' + variableName);
                logOutput += `Error: Data type mismatch. ${variableName}\n`;
            }
            existingCdeObj = existingCde.toObject();
            await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true}).catch(err => {
                console.log(newCdeObj);
                console.log(existingCdeObj);
                console.log(`${DEFAULT_RADX_CONFIG.source} await updateCde(existingCdeObj error: ${JSON.stringify(err)}`);
            });
            existingDeCount++;
        }
        else{
            existingCde = await newCde.save();
            console.log('Create new CDE with tinyId: ' + existingCde.tinyId);
            logOutput += `Create new CDE with tinyId: ${existingCde.tinyId}\n`;
            newDeCount++;
        }

        await updateRawArtifact(existingCde, newCdeObj, DEFAULT_RADX_CONFIG.source, DEFAULT_RADX_CONFIG.classificationOrgName);



        if(cdeType === 'Bundle'){
            const bundleName = getCell(row, 'Name of Bundle, Standardized Instrument, Composite');
            if(!!formMap[bundleName]){
                formMap[bundleName].push({row,cde:newCdeObj});
            }
            else{
                console.log('should have had form but do not yet: ' + getCell(row,'naming.designation'));
            }
        }
    }
    else{
        formMap[getCell(row,'naming.designation')] = []
    }

    return logOutput;
}

async function doOneForm(formRow: any, rows: any[]){
    const form = await createForm(formRow, rows);

    const newForm = new formModel(form);
    const newFormObj = newForm.toObject();
    const existingForm = await newForm.save();
    newFormCount++;
    await updateRawArtifact(existingForm, newFormObj, DEFAULT_RADX_CONFIG.source, DEFAULT_RADX_CONFIG.classificationOrgName);
}

async function runForm(formattedRows: any[], formMap: any){
    for (const row of formattedRows) {
        const cdeType = getCell(row,'CDE Type');
        if(cdeType !== 'Bundle' && cdeType !== 'Individual CDE'){
            await doOneForm(row, formMap[getCell(row,'naming.designation')]);
        }
    }

}


async function runCDE(formattedRows: any[], formMap: any){
    let cdeLog = '';
    for (const row of formattedRows) {
        cdeLog += await doOneCde(row, formMap);
    }
    return cdeLog;
}


async function run() {
    const workbook = XLSX.readFile(radxExecutiveCommittee);
    const workBookRows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const formattedRows = formatRows('RadxExecCDEs.csv', workBookRows);
    const formMap = {
    };
    await runCDE(formattedRows, formMap);
    // Skip doing forms for now
    // await runForm(formattedRows, formMap);
}

export async function runDataLoad(csvFile: any){
    const workbook = XLSX.read(csvFile);
    const workBookRows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const formattedRows = formatRows('UploadedFile', workBookRows);
    const formMap = {
    };
    const cdeLogOutput = await runCDE(formattedRows, formMap);
    // Skip doing forms for now
    // await runForm(formattedRows, formMap);
    return `Finished loading with no errors\n${cdeLogOutput}\nnewDeCount: ${newDeCount}\nexistingDeCount: ${existingDeCount}\nnewFormCount: ${newFormCount}`;
}


run().then(() => {
    console.log('Finished loadRADxByCsv.');
    console.log(`newDeCount: ${newDeCount}.`);
    console.log(`existingDeCount: ${existingDeCount}.`);
    console.log(`newFormCount: ${newFormCount}.`);

    process.exit(0);
});