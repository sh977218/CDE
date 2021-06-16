import { isEmpty, trim, groupBy } from 'lodash';

const XLSX = require('xlsx');

import { dataElementModel } from 'server/cde/mongo-cde';
import { vteDataElementsMappingCsv } from 'ingester/createMigrationConnection';
import { DEFAULT_NHLBI_CONFIG, NhlbiConfig } from 'ingester/nhlbi/shared/utility';
import { formatRows, getCell, mergeDesignations, mergeDefinitions } from 'ingester/nhlbi/shared/utility';
import { BATCHLOADER, findOneCde, imported, lastMigrationScript, updateCde, updateRawArtifact } from 'ingester/shared/utility';
import { createNhlbiCde } from 'ingester/nhlbi/cde/cde';
import { parseNhlbiClassification } from 'ingester/nhlbi/cde/ParseClassification';
import { CdeForm } from 'shared/form/form.model';

let deCount = 0;
let existingDeCount = 0;
let newDeCount = 0;

const totalNhlbiProcessed = 0;

const nhlbiConfig = new NhlbiConfig();
nhlbiConfig.registrationStatus = 'Qualified';

function assignIsthId(existingCde: CdeForm, row: any) {
    let isthIdExists = false;
    const isthID = getCell(row, DEFAULT_NHLBI_CONFIG.source);
    existingCde.ids.forEach(i => {
        if (i.id === isthID) {
            isthIdExists = true;
        }
    });
    if (!isthIdExists) {
        existingCde.ids.push({source: 'ISTH', id: isthID});
    }
}

async function doOneNhlbiCde(row: any) {
    const nlmId = getCell(row, 'NLM ID');
    const cond = {
        archived: false,
        tinyId: nlmId,
        'registrationState.registrationStatus': {$ne: 'Retired'}
    };
    const existingCdes: any[] = await dataElementModel.find(cond);
    let existingCde: any = findOneCde(existingCdes);
    const nhlbiCde = await createNhlbiCde(row);
    const newCde = new dataElementModel(nhlbiCde);
    const newCdeObj = newCde.toObject();
    if(existingCde){
        console.log(`CDE already exists with NLM ID: ${getCell(row, 'NLM ID')}`);
        let existingCdeObj = existingCde.toObject();
        parseNhlbiClassification(existingCdeObj, row);
        existingCde.classification = existingCdeObj.classification;
        existingCde.lastMigrationScript = lastMigrationScript;
        existingCde.imported = imported;
        existingCde.changeNote = lastMigrationScript;
        mergeDefinitions(existingCdeObj, newCdeObj);
        existingCde.definitions = existingCdeObj.definitions;
        mergeDesignations(existingCdeObj, newCdeObj);
        existingCde.designations = existingCdeObj.designations;
        existingCde.sources = [...existingCde.sources, ...nhlbiCde.sources];

        if (existingCde.valueDomain.datatype !== nhlbiCde.valueDomain.datatype) {
            const variableName = getCell(row, 'Data Element Name');
            console.log('Error: Data type mismatch. ' + variableName);
        }
        assignIsthId(existingCde, row);
        existingCdeObj = existingCde.toObject();
        await updateCde(existingCdeObj, BATCHLOADER, {updateSource: true}).catch(err => {
            console.log(newCdeObj);
            console.log(existingCdeObj);
            console.log(`NHLBI await updateCde(existingCdeObj error: ${JSON.stringify(err)}`);
            process.exit(1);
        });
        existingDeCount++;
    }
    else{
        existingCde = await newCde.save();
        console.log('Create new CDE with tinyId: ' + existingCde.tinyId);
        newDeCount++;
    }
    await updateRawArtifact(existingCde, newCdeObj, 'International Society on Thrombosis and Haemostasis (ISTH)', 'NHLBI');
}

async function run(config = DEFAULT_NHLBI_CONFIG) {
    const workbook = XLSX.readFile(vteDataElementsMappingCsv);
    const nhlbiRows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const formattedRows = formatRows('VTEdataelements.csv', nhlbiRows);
    deCount = formattedRows.length;
    for (const row of formattedRows) {
        await doOneNhlbiCde(row);
    }
}


run(nhlbiConfig).then(() => {
    console.log('Finished loadNhlbiByCsv.');
    console.log(`newDeCount: ${newDeCount}.`);
    console.log(`existingDeCount: ${existingDeCount}.`);

    process.exit(0);
});