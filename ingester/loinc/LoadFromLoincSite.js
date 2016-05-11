var async = require('async'),
    webdriver = require('selenium-webdriver'),
    MigrationLoincModal = require('../createConnection').MigrationLoincModal
    ;

var testArray = ['66067-0', '79723-3', '79724-1'];

var url_prefix = 'http://r.details.loinc.org/LOINC/';
var url_postfix = '.html';
var url_postfix_para = '?sections=Comprehensive';

function parsingHtml(driver, cb) {
    var obj = {};
    driver.findElements(webdriver.By.xpath());
    cb(obj);
}

function run(loincArray) {
    async.series([
        function (cb) {
            MigrationLoincModal.remove({}, function (err) {
                if (err) throw err;
                console.log('removed migration loinc collection.');
                cb();
            });
        },
        function (cb) {
            var driver = new webdriver.Builder().forBrowser('firefox').build();
            driver.get('https://www.google.com');
            driver.quit();
            cb();
/*
            async.forEach(loincArray, function (loinc, doneOneLoinc) {
                var url = url_prefix + loinc.trim() + url_postfix + url_postfix_para;
                driver.get(url);
                parsingHtml(driver, function (obj) {
                    new MigrationLoincModal(obj).save(function (error) {
                        if (error) throw error;
                        doneOneLoinc();
                    });
                });
            }, function doneAllLoinc() {
            });
*/
        },
        function () {
            console.log('finished all');
            process.exit(1);
        }
    ]);
}

run(testArray);