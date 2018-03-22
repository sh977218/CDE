const fs = require('fs');
const LoadSleepDataByFolder = require('./LoadSleepDataByFolder');

let deCount = 0;

const PATH = 'S:/MLB/CDE/SleepData/';

let FOLDERS = fs.readdirSync(PATH);



async function doIt() {
    let totalCount = 0;
    for (let folder of FOLDERS) {
        // new LoadSleepDataByFolder.LoadSleepDataByFolder().run(PATH + folder + '/', () => {
        totalCount += await LoadSleepDataByFolder.run(PATH + folder + '/');
        console.log(totalCount);
    }
}

doIt();
