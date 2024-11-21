const XLSX = require('xlsx');

import {runOneNinrForm} from 'ingester/ninr/csv/form/form';
import {sleep} from 'ingester/shared/utility';
import {formatRows} from 'ingester/ninds/csv/shared/utility';

async function run() {
    await sleep(20000);
    const workbook = XLSX.readFile(SocialDeterminantsOfHealthXlsx, {raw: true});
    const ninrCsvRows = XLSX.utils.sheet_to_json(workbook.Sheets.New_SDH);
    const formattedNinrCsvRows = formatRows('SocialDeterminantsOfHealth_06152020', ninrCsvRows);
    const formName = 'BRICS Social Determinants of Health';
    await runOneNinrForm(formName, formattedNinrCsvRows, SocialDeterminantsOfHealthXlsx);
    console.log('Wait 20 seconds for elastic search to catch up......');
    await sleep(20000);
}

run().then(() => {
    console.log('Finished.');
    process.exit(0);
}, err => {
    console.log('Error: ' + err);
    process.exit(1);
});
