let async = require('async');
let webdriver = require('selenium-webdriver');

let baseUrl = require('../../createMigrationConnection').PhenxURL;
let MigrationMeasureModel = require('../../createMigrationConnection').MigrationMeasureModel;
let MigrationProtocolModel = require('../../createMigrationConnection').MigrationProtocolModel;
let ParseOneMeasure = require('./ParseOneMeasure');

let measureCount = 0;

function doLoadPhenxMeasure(done, loadLoinc) {
    let driver = new webdriver.Builder().forBrowser('chrome').build();
    driver.get(baseUrl);
    let measureXpath = "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td/div/div/a[2]";
    driver.findElements(webdriver.By.xpath(measureXpath)).then(function (measureLinks) {
        async.forEachSeries(measureLinks, function (measureLink, doneOneMeasureLink) {
            let measure = {protocols: []};
            async.series([
                function parsingMeasureBrowseId(doneParsingMeasureBrowserId) {
                    measureLink.findElement(webdriver.By.css('span')).getText().then(function (browserIdText) {
                        measure['browserId'] = browserIdText.replace('#', '').trim();
                        doneParsingMeasureBrowserId();
                    });
                },
                function parsingMeasureHref(doneParsingMeasureHref) {
                    measureLink.getAttribute('href').then(function (hrefText) {
                        measure['href'] = hrefText.trim();
                        doneParsingMeasureHref();
                    });
                },
                function parseOneMeasure(doneParseOneMeasure) {
                    ParseOneMeasure.parseOneMeasure(measure, doneParseOneMeasure, loadLoinc);
                }
            ], function () {
                new MigrationMeasureModel(measure).save(function (e) {
                    if (e) throw e;
                    else {
                        measureCount++;
                        console.log('measureCount: ' + measureCount);
                        doneOneMeasureLink();
                    }
                });
            });
        });
    });
}

exports.run = function (loadLoinc, cb) {
    async.series([
        function removeMeasureCollection(doneRemoveMigrationMeasure) {
            MigrationMeasureModel.remove({}, function (err) {
                console.log('Removed all doc in migration measure collection');
                if (err) throw err;
                doneRemoveMigrationMeasure();
            });
        },
        function removeProtocolCollection(doneRemoveMigrationProtocol) {
            MigrationProtocolModel.remove({}, function (err) {
                console.log('Removed all doc in migration protocol collection');
                if (err) throw err;
                doneRemoveMigrationProtocol();
            });
        },
        function (doneLoadPhenxMeasure) {
            doLoadPhenxMeasure(doneLoadPhenxMeasure, loadLoinc);
        },
        function () {
            console.log('Finished grab all measures from PhenX website');
            if (cb) cb();
            else process.exit(1);
        }]);
};

exports.run(false);