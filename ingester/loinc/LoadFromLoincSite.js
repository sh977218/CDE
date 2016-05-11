var async = require('async'),
    webdriver = require('selenium-webdriver'),
    MigrationLoincModal = require('../createConnection').MigrationLoincModal
    ;

var testArray = ['66067-0', '79723-3', '79724-1'];

var url_prefix = 'http://r.details.loinc.org/LOINC/';
var url_postfix = '.html';
var url_postfix_para = '?sections=Comprehensive';

var driver;
function parsingHtml(driver, cb) {
    var obj = {};
    driver.findElements(webdriver.By.xpath());
    cb(obj);
}
function goToLoinc(loinc, cb) {
    var url = url_prefix + loinc.trim() + url_postfix + url_postfix_para;
    driver.get(url);
    parsingHtml(driver, function (obj) {
        cb(obj);
    });
}
function cleanMigrationLoincCollection(cb) {
    MigrationLoincModal.remove({}, function (err) {
        if (err) throw err;
        if (cb) cb();
    });
}
function run(loincArray) {
    cleanMigrationLoincCollection(function () {
        driver = new webdriver.Builder().forBrowser('firefox').build();
        async.each(loincArray, function (loinc, doneOneLoinc) {
            goToLoinc(loinc, function (obj) {
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

run(testArray);