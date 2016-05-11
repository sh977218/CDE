var async = require('async'),
    webdriver = require('selenium-webdriver'),
    MigrationLoincModal = require('../createConnection').MigrationLoincModal
    ;
var url_prefix = 'http://r.details.loinc.org/LOINC/';
var url_postfix = '.html';
var url_postfix_para = '?sections=Comprehensive';

var driver;
function cleanMigrationLoincModal(cb) {
    MigrationLoincModal.remove({}, function (err) {
        if (err) throw err;
        cb();
    });
}
function parsingHtml(driver, cb) {
    var obj = {};
    driver.findElements(webdriver.By.xpath());
    cb(obj);
}
function gotoLoinc(loinc, cb) {
    driver.get(url_prefix + loinc.trim() + url_postfix + url_postfix_para);
    parsingHtml(driver, function (obj) {
        cb(obj);
    });
}
function run(loincArray) {
    cleanMigrationLoincModal(function () {
        driver = new webdriver.Builder().forBrowser('firefox').build();
        async.forEachSeries(loincArray, function (loinc, doneOneLoinc) {
            gotoLoinc(loinc, function (obj) {
                var loincObj = new MigrationLoincModal(obj);
                loincObj.save(function () {
                    doneOneLoinc();
                });
            });
        }, function doneAllLoinc() {
            console.log('finished all');
            driver.quit();
            process.exit(1);
        });
    });
}

run();