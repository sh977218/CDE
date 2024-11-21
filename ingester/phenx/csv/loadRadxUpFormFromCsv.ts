const XLSX = require('xlsx');
import {doOneRedCapForm} from 'ingester/phenx/csv/form/form';
import {RadxUpConfig} from 'ingester/phenx/Shared/utility';
import {formatRows} from 'ingester/phenx/csv/shared/utility';

const radxUpConfig = new RadxUpConfig();

async function run(config = radxUpConfig) {
    const formName = 'RADxUPDev_DataDictionary_2020';
    const workbook = XLSX.readFile(RED_CAP_CSV);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1);
    const formattedRows = formatRows(rows);
    await doOneRedCapForm(formName, formattedRows, config);
}

run().then(() => {
        console.log('Finished.');
        process.exit(0);
    }, err => {
        console.log('err: +' + err);
        process.exit(1);
    }
);

