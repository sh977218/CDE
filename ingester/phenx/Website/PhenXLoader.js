var webdriver = require('selenium-webdriver');
var async = require('async');
var baseUrl = require('../createMigrationConnection').PhenxURL;
var MigrationMeasureModel = require('../createMigrationConnection').MigrationMeasureModel;
var ParseOneMeasure = require('./ParseOneMeasure');

function doLoadPhenxMeasure(done) {
    var driver = new webdriver.Builder().forBrowser('chrome').build();
    driver.get(baseUrl);
    var measureXpath = "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td/div/div/a[2]";
    driver.findElements(webdriver.By.xpath(measureXpath)).then(function (measureLinks) {
        async.eachSeries(measureLinks, function (measureLink, doneOneMeasureLink) {
            var measure = {};
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
                    ParseOneMeasure.parseOneMeasure(measure, doneParseOneMeasure);
                }
            ]);
        })
    })
}

exports.run = function (cb) {
    async.series([
        function removeMeasureCollection(doneRemoveMigrationMeasure) {
            MigrationMeasureModel.remove({}, function (err) {
                console.log('Removed all doc in migration measure collection');
                if (err) throw err;
                doneRemoveMigrationMeasure();
            });
        },
        function (doneLoadPhenxMeasure) {
            doLoadPhenxMeasure(doneLoadPhenxMeasure);
        },
        function () {
            console.log('Finished grab all measures from PhenX website');
            if (cb)cb();
            else {
                process.exit(1);
            }
        }])
};