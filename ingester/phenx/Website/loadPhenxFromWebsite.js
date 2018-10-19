const webdriver = require('selenium-webdriver');

let baseUrl = require('../../createMigrationConnection').PhenxURL;
let MeasureModel = require('../../createMigrationConnection').MeasureModel;
let ProtocolModel = require('../../createMigrationConnection').ProtocolModel;
let ParseMeasure = require('./ParseMeasure');

let measureCount = 0;

function doLoadPhenxMeasure() {
    return new Promise(async (resolve, reject) => {
        let driver = new webdriver.Builder().forBrowser('chrome').build();
        await driver.get(baseUrl);
        let measureXpath = "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td/div/div/a[2]";
        let measureLinks = await driver.findElements(webdriver.By.xpath(measureXpath));
        for (let measureLink of measureLinks) {
            console.log("There are " + measureLinks.length + " measurements to load.");
            let browserIdText = await measureLink.findElement(webdriver.By.css('span')).getText();
            let hrefText = await measureLink.getAttribute('href');
            let measure = await ParseMeasure.parseMeasure(hrefText.trim());
            measure['href'] = hrefText.trim();
            measure['browserId'] = browserIdText.replace('#', '').trim();
            await new MeasureModel(measure).save();
            measureCount++;
        }
        resolve();
    })
}

async function run() {
    await MeasureModel.remove({});
    console.log('Removed all doc in migration measure collection');
    await ProtocolModel.remove({});
    console.log('Removed all doc in migration protocol collection');
    await doLoadPhenxMeasure();
    console.log('Finished grab all measures from PhenX website');
}

run().then(() => {
    process.exit(1);
}, err => console.log(err));

setInterval(() => {
    console.log("measureCount: " + measureCount);
}, 5000);