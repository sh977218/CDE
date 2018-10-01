let _ = require('lodash');
let async = require('async');
let webdriver = require('selenium-webdriver');
let By = webdriver.By;
let ParseOneProtocol = require('./ParseOneProtocol');
let driver = new webdriver.Builder().forBrowser('chrome').build();

let MigrationProtocolModel = require('../../createMigrationConnection').MigrationProtocolModel;

function parsingIntroduction(driver, measure) {
    let instructionXpath = '/html/body/center/table/tbody/tr[3]/td/div/div[5]/div[1]';
    return new Promise(async (resolve, reject) => {
        let text = await driver.findElement(By.xpath(instructionXpath)).getText();
        measure.introduction = text.trim();
        resolve();
    })
}

function parsingKeywords(driver, measure) {
    let keywordsXpath1 = "//p[./b[normalize-space(text())='Keywords']]";
    return new Promise(async (resolve, reject) => {
        let keywordsText1 = await driver.findElement(By.xpath(keywordsXpath1)).getText();
        let keyWords1 = keywordsText1.replace(/keywords:/ig, "").trim();
        if (_.isEmpty(keyWords1)) {
            let keywordsXpath2 = "//p[./b[normalize-space(text())='Keywords']]/following-sibling::p[1]";
            let keywordsText2 = await driver.findElement(By.xpath(keywordsXpath2)).getText();
            let keyWords2 = keywordsText2.trim();
            if (_.isEmpty(keyWords2)) {
                measure.keywords = [];
            } else {
                measure.keywords = keyWords2.split(",");
                measure.keywords.forEach(k => k.trim());
            }
        } else {
            measure.keywords = keyWords1.split(",");
            measure.keywords.forEach(k => k.trim());
        }
        resolve();
    })
}

function parsingClassification(driver, measure) {
    let classificationXpath = "//p[@class='back'][1]/a";
    return new Promise(async (resolve, reject) => {
        let classificationArr = await driver.findElements(By.xpath(classificationXpath));
        measure.classification = [];
        for (let c of classificationArr) {
            let text = await c.getText();
            measure.classification.push(text.trim());
        }
        measure.measureName = _.last(measure.classification);
        resolve();
    })
}

function parsingProtocolLinks(driver, measure, loadLoinc) {
    let protocolLinksXpath = "//*[@id='browse_measure_protocol_list']/table/tbody/tr/td/div/div[@class='search']/a[2]";
    return new Promise(async (resolve, reject) => {
        let protocolLinks = await driver.findElements(By.xpath(protocolLinksXpath));
        let protocols = [];
        for (let protocolLink of protocolLinks) {
            let protocol = {classification: []};
            let browserIdText = await protocolLink.findElement(webdriver.By.css('span')).getText();
            let protocolId = browserIdText.replace('#', '').trim();
            protocol.protocolId = protocolId;
            protocols.push({protocolId: protocolId});

            let linkText = await protocolLink.getAttribute('href');
            ParseOneProtocol.parseProtocol(protocol, linkText.trim(), function () {
                cb();
            }, loadLoinc);

            protocol.Keywords = measure.keywords;
            await new MigrationProtocolModel(protocol).save();
        }
        measure.protocols = protocols;
        resolve();
    })
}

exports.parseOneMeasure = function (measure, loadLoinc) {
    return new Promise(async (resolve, reject) => {
        driver.get(measure.href);
        await parsingIntroduction(driver, measure);
        await parsingKeywords(driver, measure);
        await parsingClassification(driver, measure);
        await parsingProtocolLinks(driver, measure, loadLoinc);
        resolve();
    })
};