const webdriver = require('selenium-webdriver');

let baseUrl = require('../../createMigrationConnection').PhenxURL;
let MeasureModel = require('../../createMigrationConnection').MeasureModel;
let ParseMeasure = require('./ParseMeasure');

let measureCount = 0;

async function doLoadPhenxMeasure() {
    let driver = await new webdriver.Builder().forBrowser('firefox').build();
    await driver.get(baseUrl);
    let measureXpath = "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td/div/div/a[2]";
    let measureLinks = await driver.findElements(webdriver.By.xpath(measureXpath));
    //measureLinks.splice(0, 20);
    console.log("There are " + measureLinks.length + " measurements to load.");
    for (let measureLink of measureLinks) {
        let browserIdText = await measureLink.findElement(webdriver.By.css('span')).getText();
        let browserId = browserIdText.replace('#', '').trim();
        let existingMeasure = await MeasureModel.findOne({browserId: browserId});
        if (!existingMeasure) {
            let hrefText = await measureLink.getAttribute('href');
            let measure = await ParseMeasure.parseMeasure(hrefText.trim());
            measure['href'] = hrefText.trim();
            measure['browserId'] = browserId;
            await new MeasureModel(measure).save();
        }
        measureCount++;
        console.log("measureCount: " + measureCount);
    }
}

async function run() {
    /*
        await MeasureModel.remove({});
        console.log('Removed all doc in migration measure collection');
    */
    await doLoadPhenxMeasure();
    console.log('Finished grab all measures from PhenX website');
}

run().then(() => {
    process.exit(1);
}, err => console.log(err));
