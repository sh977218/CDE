const async = require('async');
const webdriver = require('selenium-webdriver');

let baseUrl = require('../../createMigrationConnection').PhenxURL;
let MigrationMeasureModel = require('../../createMigrationConnection').MigrationMeasureModel;
let MigrationProtocolModel = require('../../createMigrationConnection').MigrationProtocolModel;
let ParseOneMeasure = require('./ParseOneMeasure');

let measureCount = 0;

function doLoadPhenxMeasure(done, loadLoinc) {
    return new Promise(async (resolve, reject) => {
        let driver = new webdriver.Builder().forBrowser('chrome').build();
        driver.get(baseUrl);
        let measureXpath = "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td/div/div/a[2]";
        let measureLinks = await driver.findElements(webdriver.By.xpath(measureXpath));
        for (let measureLink of measureLinks) {
            let measure = {protocols: []};
            let browserIdText = await measureLink.findElement(webdriver.By.css('span')).getText();
            measure['browserId'] = browserIdText.replace('#', '').trim();
            let hrefText = await measureLink.getAttribute('href');
            measure['href'] = hrefText.trim();
            await ParseOneMeasure.parseOneMeasure(measure, loadLoinc);
            await new MigrationMeasureModel(measure).save();
            measureCount++;
            console.log('measureCount: ' + measureCount);
        }
    })
}

async function run(loadLoinc, cb) {
    await MigrationMeasureModel.remove({});
    console.log('Removed all doc in migration measure collection');
    await MigrationProtocolModel.remove({});
    console.log('Removed all doc in migration protocol collection');
    await doLoadPhenxMeasure(loadLoinc);
    console.log('Finished grab all measures from PhenX website');
    process.exit(1);
};

run(false).then();