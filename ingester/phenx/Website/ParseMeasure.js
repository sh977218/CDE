let _ = require('lodash');
let webdriver = require('selenium-webdriver');
let By = webdriver.By;

let ParseProtocol = require('./ParseProtocol');

let tasks = [
    {
        sectionName: 'introduction',
        function: parsingIntroduction,
        xpath: "/html/body/center/table/tbody/tr[3]/td/div/div[5]/div[1]"
    },
    {
        sectionName: 'keywords',
        function: parsingKeywords,
        xpath: "//p[./b[normalize-space(text())='Keywords']]"
    },
    {
        sectionName: 'classification',
        function: parsingClassification,
        xpath: "//*[@id='phenxTooltip']/following-sibling::p[@class='back'][1]/a"
    },
    {
        sectionName: 'protocols',
        function: parsingProtocolLinks,
        xpath: "//*[@id='browse_measure_protocol_list']/table/tbody/tr/td/div/div[@class='search']/a[2]"
    }
];

async function parsingIntroduction(elements) {
    let introduction = await elements[0].getText();
    return introduction.trim();
}

async function parsingKeywords(elements) {
    let keywords = [];
    let keywordsText1 = await elements[0].getText();
    let keyWords1 = keywordsText1.replace(/keywords:/ig, "").trim();
    if (_.isEmpty(keyWords1)) {
        let keywordsXpath2 = "//p[./b[normalize-space(text())='Keywords']]/following-sibling::p[1]";
        let keywordsText2 = await driver.findElement(By.xpath(keywordsXpath2)).getText();
        let keyWords2 = keywordsText2.trim();
        if (_.isEmpty(keyWords2)) {
            keywords = [];
        } else {
            keywords = keyWords2.split(",");
            keywords.forEach(k => k.trim());
        }
    } else {
        keywords = keyWords1.split(",");
        keywords.forEach(k => k.trim());
    }
    return keywords;
}

async function parsingClassification(elements) {
    let classification = [];
    for (let c of elements) {
        let text = await c.getText();
        classification.push(text.trim());
    }
    return classification;
}

async function parsingProtocolLinks(elements) {
    let protocols = [];
    for (let protocolLink of elements) {
        let browserIdText = await protocolLink.findElement(By.css('span')).getText();
        let protocolId = browserIdText.replace('#', '').trim();
        let linkText = await protocolLink.getAttribute('href');
        let protocol = await ParseProtocol.parseProtocol(linkText.trim());
        protocol.protocolId = protocolId;
        protocols.push(protocol);
    }
    return protocols;
}

exports.parseMeasure = async function (link) {
    let driver = await new webdriver.Builder().forBrowser('firefox').build();
    driver.get(link);
    let measure = {};
    for (let task of tasks) {
        let elements = await driver.findElements(By.xpath(task.xpath));
        if (elements && elements.length > 0)
            measure[task.sectionName] = await task.function(elements);
    }
    return measure;
};