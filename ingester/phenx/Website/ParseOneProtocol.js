let async = require('async');
let webdriver = require('selenium-webdriver');
let By = webdriver.By;
let driver = new webdriver.Builder().forBrowser('chrome').build();

let LoadFromLoincSite = require('../../loinc/Website/LOINCLoader');

let tasks = [{
    sectionName: 'Protocol Release Date',
    function: parseTextContent,
    xpath: "//*[@id='element_RELEASE_DATE']"
}, {
    sectionName: 'Protocol Name From Source',
    function: parseTextContent,
    xpath: "//*[@id='element_PROTOCOL_NAME_FROM_SOURCE']"
}, {
    sectionName: 'Description of Protocol',
    function: parseTextContent,
    xpath: "//*[@id='element_DESCRIPTION']"
}, {
    sectionName: 'Specific Instructions',
    function: parseTextContent,
    xpath: "//*[@id='element_SPECIFIC_INSTRUCTIONS']"
}, {
    sectionName: 'Protocol',
    function: parseTextContent,
    xpath: "//*[@id='element_PROTOCOL_TEXT']"
}, {
    sectionName: 'Variables',
    function: parseTableContent,
    xpath: "//*[@id='element_VARIABLES']//table"
}, {
    sectionName: 'Selection Rationale',
    function: parseTextContent,
    xpath: "//*[@id='element_SELECTION_RATIONALE']"
}, {
    sectionName: 'Source',
    function: parseTextContent,
    xpath: "//*[@id='element_SOURCE']"
}, {
    sectionName: 'Life Stage',
    function: parseTextContent,
    xpath: "//*[@id='element_LIFESTAGE']"
}, {
    sectionName: 'Language',
    function: parseTextContent,
    xpath: "//*[@id='element_LANGUAGE']"
}, {
    sectionName: 'Participant',
    function: parseTextContent,
    xpath: "//*[@id='element_PARTICIPANT']"
}, {
    sectionName: 'Personnel and Training Required',
    function: parseTextContent,
    xpath: "//*[@id='element_PERSONNEL_AND_TRAINING_REQD']"
}, {
    sectionName: 'Equipment Needs',
    function: parseTextContent,
    xpath: "//*[@id='element_EQUIPMENT_NEEDS']"
}, {
    sectionName: 'Standards',
    function: parseTableContent,
    xpath: "//*[@id='element_STANDARDS']//table"
}, {
    sectionName: 'General References',
    function: parseGeneralReferences,
    xpath: "//*[@id='element_REFERENCES']"
}, {
    sectionName: 'Mode of Administration',
    function: parseTextContent,
    xpath: "//*[@id='element_PROTOCOL_TYPE']"
}, {
    sectionName: 'Derived Variables',
    function: parseTextContent,
    xpath: "//*[@id='element_DERIVED_VARIABLES']"
}, {
    sectionName: 'Requirements',
    function: parseTableContent,
    xpath: "//*[@id='element_REQUIREMENTS']//table"
}, {
    sectionName: 'Process and Review',
    function: parseTextContent,
    xpath: "//*[@id='element_PROCESS_REVIEW']"
}];

function parseTextContent(obj, task, element, cb) {
    element.getText().then(function (text) {
        obj[task.sectionName] = text.trim();
        cb();
    });
}

function parseGeneralReferences(obj, task, element, cb) {
    var generalReferences = [];
    element.findElements(By.xpath('p')).then(function (pElements) {
        async.forEachSeries(pElements, (pElement, doneOneP) => {
            pElement.getText().then(function (text) {
                generalReferences.push(text.trim());
                doneOneP();
            });
        }, function doneAllPs() {
            obj[task.sectionName] = generalReferences;
            cb();
        });
    });
}

function parseTableContent(obj, task, element, cb) {
    let records = [];
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        let keys = [];
        async.series([function getTableHeader(doneGetTableHeader) {
            trs[0].findElements(By.xpath('th')).then(function (ths) {
                async.forEachSeries(ths, function (th, doneOneTh) {
                    th.getText().then(function (keyText) {
                        keys.push(keyText.trim());
                        doneOneTh();
                    });
                }, function doneAllThs() {
                    trs.shift();
                    doneGetTableHeader();
                });
            });
        }, function getTableContent(doneGetTableContent) {
            async.forEachSeries(trs, function (tr, doneOneTr) {
                let record = {};
                tr.findElements(By.xpath('td')).then(function (tds) {
                    let i = 0;
                    async.forEachSeries(tds, function (td, doneOneTd) {
                        td.getText().then(function (tdText) {
                            record[keys[i]] = tdText.trim();
                            i++;
                            doneOneTd();
                        });
                    }, function doneAllTds() {
                        i = 0;
                        records.push(record);
                        record = {};
                        doneOneTr();
                    });
                });
            }, function doneAllTrs() {
                doneGetTableContent();
            });
        }], function () {
            obj[task.sectionName] = records;
            cb();
        });
    });
}

function doTask(driver, task, obj, cb) {
    return new Promise(async (resolve, reject) => {
        let elements = await driver.findElements(By.xpath(task.xpath));
        if (elements.length !== 1) resolve();
        else {
            let html = await elements[0].getAttribute('outerHTML');
            obj[task.sectionName] = {
                HTML: html
            };
            task.function(obj, task, elements[0], resolve);
        }
    })
}

exports.parseProtocol = function (protocol, link, loadLoinc) {
    driver.get(link);
    return new Promise(async (resolve, reject) => {
        await driver.findElement(By.id('button_showfull')).click();
        for (let task of tasks) {
            await doTask(driver, task, protocol);
        }
        for (let standard of protocol['Standards']) {
            if (standard.Source === 'LOINC') {
                if (loadLoinc) {
                    let loinc = await LoadFromLoincSite.runOneLoinc(standard.ID);
                }
            }
        }
        let classificationArr = await driver.findElements(By.xpath("//p[@class='back'][1]/a"));
        for (let c of classificationArr) {
            let text = await c.getText();
            protocol.classification.push(text.trim());
        }

        resolve();
    })
};