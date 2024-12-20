const fs = require('fs');
const LoadSleepDataByFolder = require('./LoadSleepDataByFolder');

const PATH = 'S:/MLB/CDE/SleepData/';

let FOLDERS = fs.readdirSync(PATH);

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
