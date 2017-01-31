var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var async = require('async');
var driver = new webdriver.Builder().forBrowser('chrome').build();
var ParseOneProtocol = require('./ParseOneProtocol');

function parsingIntroduction(measure, done) {
    var instructionXpath = '/html/body/center/table/tbody/tr[3]/td/div/div[5]/div[1]';
    driver.findElement(By.xpath(instructionXpath)).getText().then(function (text) {
        measure.introduction = text.trim();
        done();
    });
};

function parsingClassification(measure, done) {
    var classificationXpath = "//p[@class='back'][1]/a";
    driver.findElements(By.xpath(classificationXpath)).then(function (classificationArr) {
        measure.classification = [];
        async.eachSeries(classificationArr, function (c, doneOneClassification) {
            c.getText().then(function (text) {
                measure.classification.push(text.trim());
                doneOneClassification();
            });
        }, function doneAllClassification() {
            done();
        });
    });
};
function parsingProtocolLinks(measure, done) {
    var protocolLinksXpath = "//*[@id='browse_measure_protocol_list']/table/tbody/tr/td/div/div[@class='search']/a[2]";
    driver.findElements(By.xpath(protocolLinksXpath)).then(function (protocolLinks) {
        async.eachSeries(protocolLinks, function (protocolLink, doneOneProtocolLink) {
            protocolLink.getAttribute('href').then(function (linkText) {
                ParseOneProtocol.parseProtocol(measure, linkText.trim(), doneOneProtocolLink);
            });
        }, function doneAllProtocolLinks() {
            done();
        });
    })
};

exports.parseOneMeasure = function (measure, cb) {
    driver.get(measure.href);
    async.series([
        function (doneIntroduction) {
            parsingIntroduction(measure, doneIntroduction);
        },
        function (doneClassification) {
            parsingClassification(measure, doneClassification)
        },
        function (doneProtocol) {
            parsingProtocolLinks(measure, doneProtocol);
        }
    ], function doneOneMeasure() {
        cb();
    });
};