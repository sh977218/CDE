import { NINDS_PRECLINICAL_NEI_FILE_PATH } from 'ingester/shared/utility';

const fs = require('fs');
const LoadSleepDataByFolder = require('./LoadSleepDataByFolder');

const PATH = 'S:/MLB/CDE/SleepData/';

let FOLDERS = fs.readdirSync(PATH, 'utf8');

async function doIt() {
    let totalCount = 0;
    for (let FOLDER of FOLDERS) {
        let count = await LoadSleepDataByFolder.run(PATH, FOLDER).catch(e => {
            console.log(e);
        });
        console.log('count: ' + count);
        totalCount += count;
    }
    console.log('total count: ' + totalCount);
    process.exit(1);
}

doIt();
