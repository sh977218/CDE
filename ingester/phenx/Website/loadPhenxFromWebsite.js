const webdriver = require('selenium-webdriver');

let baseUrl = require('../../createMigrationConnection').PhenxURL;
let MigrationMeasureModel = require('../../createMigrationConnection').MigrationMeasureModel;
let MigrationProtocolModel = require('../../createMigrationConnection').MigrationProtocolModel;
let ParseMeasure = require('./ParseMeasure');

let measureCount = 0;

function doLoadPhenxMeasure() {
    return new Promise(async (resolve, reject) => {
        let driver = new webdriver.Builder().forBrowser('chrome').build();
        await driver.get(baseUrl);
        let measureXpath = "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td/div/div/a[2]";
        let measureLinks = await driver.findElements(webdriver.By.xpath(measureXpath));
        for (let measureLink of measureLinks) {
            if (measureCount > 29) {
                let browserIdText = await measureLink.findElement(webdriver.By.css('span')).getText();
                let hrefText = await measureLink.getAttribute('href');
                let measure = await ParseMeasure.parseMeasure(hrefText.trim());
                measure['href'] = hrefText.trim();
                measure['browserId'] = browserIdText.replace('#', '').trim();
                await new MigrationMeasureModel(measure).save();
            }
            measureCount++;
        }
        resolve();
    })
}

async function run() {
    await MigrationMeasureModel.remove({});
    console.log('Removed all doc in migration measure collection');
    await MigrationProtocolModel.remove({});
    console.log('Removed all doc in migration protocol collection');
    await doLoadPhenxMeasure();
    console.log('Finished grab all measures from PhenX website');
    process.exit(1);
}

run().then(() => {
}, err => console.log(err));

setInterval(() => {
    console.log("measureCount: " + measureCount);
}, 5000);