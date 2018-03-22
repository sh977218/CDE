const fs = require('fs');
const LoadSleepDataByFolder = require('./LoadSleepDataByFolder');

let deCount = 0;

const PATH = 'S:/MLB/CDE/SleepData/';

let FOLDERS = fs.readdirSync(PATH);

for (let folder of FOLDERS) {
    new LoadSleepDataByFolder.LoadSleepDataByFolder().run(PATH + folder + '/', () => {
        deCount++;
        console.log('deCount: ' + deCount);
    });
}
