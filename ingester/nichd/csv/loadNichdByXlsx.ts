import {groupBy} from 'lodash';
import {formModel, formSourceModel} from 'server/form/mongo-form';
import {createNichdForm} from 'ingester/nichd/csv/form/form';
import {NichdConfig} from 'ingester/nichd/shared/utility';

const XLSX = require('xlsx');

let newFormCount = 0;

async function runOneNichdForm(nichdFormName: string, nichdRows: any[], config: NichdConfig) {
    const nichdFormObj = await createNichdForm(nichdFormName, nichdRows, config);
    const nichdForm = await new formModel(nichdFormObj).save();
    newFormCount++;
    console.log(`newFormCount: ${newFormCount} newForm ${nichdForm.tinyId}`);
    await new formSourceModel(nichdFormObj).save();
}

async function run(config: NichdConfig) {
    const workbook = XLSX.readFile(krabbeDataElementsXlsx);
    const nichdRows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    console.log('NICHD row length: ' + nichdRows.length);
    const nichdForms = groupBy(nichdRows, 'Project');
    for (const nichdFormName in nichdForms) {
        if (nichdForms.hasOwnProperty(nichdFormName)) {
            const nichdRows = nichdForms[nichdFormName];
            await runOneNichdForm(nichdFormName, nichdRows, config);
        }
    }
}

/*
const nichdConfig = new NichdConfig();

run(nichdConfig).then(() => {
    console.log('Finished.');
    process.exit(0);
}, err => {
    console.log(err);
    process.exit(1);
});
*/
