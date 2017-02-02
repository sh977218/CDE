var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var async = require('async');
var driver = new webdriver.Builder().forBrowser('chrome').build();
var LoadFromLoincSite = require('../../loinc/Website/LOINCLoader');

var tasks = [{
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
    function: parseTextContent,
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

function parseTableContent(obj, task, element, cb) {
    var records = [];
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        var keys = [];
        async.series([function getTableHeader(doneGetTableHeader) {
            trs[0].findElements(By.xpath('th')).then(function (ths) {
                async.forEachSeries(ths, function (th, doneOneTh) {
                    th.getText().then(function (keyText) {
                        keys.push(keyText.trim());
                        doneOneTh();
                    })
                }, function doneAllThs() {
                    trs.shift();
                    doneGetTableHeader();
                })
            })
        }, function getTableContent(doneGetTableContent) {
            async.forEachSeries(trs, function (tr, doneOneTr) {
                var record = {};
                tr.findElements(By.xpath('td')).then(function (tds) {
                    var i = 0;
                    async.forEachSeries(tds, function (td, doneOneTd) {
                        td.getText().then(function (tdText) {
                            record[keys[i]] = tdText.trim();
                            i++;
                            doneOneTd();
                        })
                    }, function doneAllTds() {
                        i = 0;
                        records.push(record);
                        record = {};
                        doneOneTr();
                    })
                })
            }, function doneAllTrs() {
                doneGetTableContent();
            });
        }], function () {
            obj[task.sectionName] = records;
            cb();
        });
    })
}

function parseOneSection(protocol, key, id, done) {
    if (id.indexOf('STANDARDS') > -1) {
    }
    else if (id.indexOf('PROTOCOL_TEXT') > -1 || newId.indexOf('Requirements') > -1 || newId.indexOf('SPECIFIC_INSTRUCTIONS') > -1) {
        driver.findElements(webdriver.By.xpath("//*[@id='" + newId + "']")).then(function (temp) {
            if (temp.length > 0) {
                temp[0].getOuterHtml().then(function (html) {
                    protocol[key.trim()] = html;
                    done();
                });
            }
            else
                done();
        });
    }
    else {
        driver.findElement(webdriver.By.id(newId)).getText().then(function (text) {
            protocol[key.trim()] = text;
            done();
        });
    }
}

function doTask(driver, task, obj, cb) {
    driver.findElements(By.xpath(task.xpath)).then(function (elements) {
        if (elements && elements.length === 0) {
            var message = 'Cannot find ' + task.sectionName + ' for loinc: ' + obj.loincId;
            cb();
        } else if (elements && elements.length > 1) {
            var message = 'find ' + elements.length + ' ' + task.sectionName + ' for loinc: ' + obj.loincId;
            cb();
        } else if (elements && elements.length === 1) {
            elements[0].getAttribute('outerHTML').then(function (html) {
                obj[task.sectionName] = {
                    HTML: html
                };
                task.function(obj, task, elements[0], cb);
            });
        } else {
            cb();
        }
    });
}

exports.parseProtocol = function (measure, link, cb) {
    driver.get(link);
    driver.findElement(By.id('button_showfull')).click().then(function () {
        async.forEach(tasks, function (task, doneOneTask) {
            doTask(driver, task, measure, doneOneTask);
        }, function doneAllTask() {
            async.forEachSeries(measure['Standards'], function (standard, doneOneStandard) {
                if (standard.Source === 'LOINC') {
                    LoadFromLoincSite.runArray([standard.ID], 'PhenX', function (loinc, doneOneLoinc) {
                        standard['LOINC'] = loinc;
                        doneOneLoinc();
                    }, function () {
                        doneOneStandard();
                    })
                } else {
                    doneOneStandard();
                }
            }, function doneAllStandards() {
                cb();
            });
        })
    });
};