import { dataElementModel } from '../../../server/cde/mongo-cde';
import { findOneCde } from '../../shared/utility';

const XLSX = require('xlsx');

async function run() {
    const sickleCellDataElementsXlsx = 'C:/Users/Peter/Downloads/SickleCellDataElements_20200305.xlsx';
    const sickleCellFormMappingXlsx = 'C:/Users/Peter/Downloads/SickleCell_NLM_FormMapping.xlsx';
    /*
        const sickleCellDataElements = await parseCSV(sickleCellDataElementsXlsx);
        const sickleCellFormMapping = await parseCSV(sickleCellFormMappingXlsx);
    */
    const workbook = XLSX.readFile(sickleCellDataElementsXlsx);
    const nhlbiCdes = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const cond = {
        archived: false,
        'ids.id': nhlbiCdes['External ID.NINDS'],
        'registrationState.registrationStatus': {$ne: 'Retired'}
    };
    const existingCdes: any[] = await dataElementModel.find(cond);
    const existingCde: any = findOneCde(existingCdes);

    console.log('a');
}

run().then(() => {
    console.log('Finished.');
    process.exit(0);
}, err => {
    console.log('Error: ' + err);
    process.exit(1);
});
