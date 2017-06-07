var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var async = require('async');
var ParseOneProtocol = require('./ParseOneProtocol');
var driver = new webdriver.Builder().forBrowser('chrome').build();
var _ = require('lodash');

function parsingIntroduction(driver, measure, done) {
    var instructionXpath = '/html/body/center/table/tbody/tr[3]/td/div/div[5]/div[1]';
    driver.findElement(By.xpath(instructionXpath)).getText().then(function (text) {
        measure.introduction = text.trim();
        done();
    });
};
function parsingKeywords(driver, measure, done) {
    var instructionXpath = "//p[./b[normalize-space(text())='Keywords']]/following-sibling::p";
    driver.findElement(By.xpath(instructionXpath)).getText().then(function (text) {
        measure.keywords = text.trim();
        done();
    });
};

function parsingClassification(driver, measure, done) {
    var classificationXpath = "//p[@class='back'][1]/a";
    driver.findElements(By.xpath(classificationXpath)).then(function (classificationArr) {
        measure.classification = [];
        async.eachSeries(classificationArr, function (c, doneOneClassification) {
            c.getText().then(function (text) {
                measure.classification.push(text.trim());
                doneOneClassification();
            });
        }, function doneAllClassification() {
            measure.measureName = _.last(measure.classification);
            done();
        });
    });
};

function parsingProtocolLinks(driver, measure, done, loadLoinc) {
    var protocolLinksXpath = "//*[@id='browse_measure_protocol_list']/table/tbody/tr/td/div/div[@class='search']/a[2]";
    driver.findElements(By.xpath(protocolLinksXpath)).then(function (protocolLinks) {
        var protocols = [];
        async.eachSeries(protocolLinks, function (protocolLink, doneOneProtocolLink) {
            var protocol = {classification: []};
            async.series([
                function (cb) {
                    protocolLink.findElement(webdriver.By.css('span')).getText().then(function (browserIdText) {
                        var protocolId = browserIdText.replace('#', '').trim();
                        protocol.protocolId = protocolId;
                        protocols.push({protocolId: protocolId});
                        cb();
                    });
                },
                function (cb) {
                    protocolLink.getAttribute('href').then(function (linkText) {
                        ParseOneProtocol.parseProtocol(protocol, linkText.trim(), function () {
                            cb();
                        }, loadLoinc);
                    });
                }
            ], function () {
                doneOneProtocolLink();
            })
        }, function doneAllProtocolLinks() {
            measure.protocols = protocols;
            done();
        });
    })
};

exports.parseOneMeasure = function (measure, cb, loadLoinc) {
    driver.get(measure.href);
    async.series([
        function (doneIntroduction) {
            parsingIntroduction(driver, measure, doneIntroduction);
        },
        function (doneKeywords) {
            parsingKeywords(driver, measure, doneKeywords);
        },
        function (doneClassification) {
            parsingClassification(driver, measure, doneClassification)
        },
        function (doneProtocol) {
            parsingProtocolLinks(driver, measure, doneProtocol, loadLoinc);
        }
    ], function doneOneMeasure() {
        cb();
    });
};