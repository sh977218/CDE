var async = require('async');
var webdriver = require('selenium-webdriver');
var By = webdriver.By;

/*
j needs to be call by reference
*/
function loadQuestionInformation(panelHierarchy, array, j, cb) {
    async.forEachSeries(panelHierarchy.elements, function (element, doneOneElement) {
        if (element.elements.length === 0) {
            var sections = array[j];
            sections[0].findElement(By.xpath('table/tbody/tr/td[1]')).getText().then(function (loincText) {
                if (loincText.trim() === element['LOINC#']) {
                    sections.shift();
                    async.forEachSeries(sections, function (section, doneOneSection) {
                        section.findElements(By.xpath('table/tbody/tr[1]/th')).then(function (sectionHeaderTable) {
                            if (sectionHeaderTable.length > 0) {
                                sectionHeaderTable[0].getText().then(function (sectionHeaderText) {
                                    var sectionHeader = sectionHeaderText.trim();
                                    if (sectionHeader === 'OBSERVATION ID IN FORM') {
                                        section.findElement(By.xpath('table/tbody/tr[2]')).getText().then(function (text) {
                                            element['OBSERVATION ID IN FORM'] = text.trim();
                                            doneOneSection();
                                        })
                                    } else if (sectionHeader === 'ANSWER CARDINALITY') {
                                        section.findElement(By.xpath('table/tbody/tr[2]')).getText().then(function (text) {
                                            element['ANSWER CARDINALITY'] = text.trim();
                                            doneOneSection();
                                        })
                                    } else {
                                        doneOneSection();
                                    }
                                })
                            } else {
                                doneOneSection();
                            }
                        })
                    }, function doneAllSections() {
                        j++;
                        doneOneElement();
                    })
                } else {
                    console.log('loinc # does not match. Question');
                    console.log('element["LOINC#"]: ' + element['LOINC#']);
                    console.log('loincText: ' + loincText.trim());
                    process.exit(1);
                }
            });
        } else {
            var sections = array[j];
            sections[0].findElement(By.xpath('table/tbody/tr/td[1]')).getText().then(function (loincText) {
                if (loincText.trim() === element['LOINC#']) {
                    sections.shift();
                    async.forEachSeries(sections, function (section, doneOneSection) {
                        section.findElements(By.xpath('table/tbody/tr[1]/th')).then(function (sectionHeaderTable) {
                            if (sectionHeaderTable.length > 0) {
                                sectionHeaderTable[0].getText().then(function (sectionHeaderText) {
                                    var sectionHeader = sectionHeaderText.trim();
                                    if (sectionHeader === 'FORM CODING INSTRUCTIONS') {
                                        section.findElement(By.xpath('table/tbody/tr[2]')).getText().then(function (text) {
                                            element['FORM CODING INSTRUCTIONS'] = text.trim();
                                            doneOneSection();
                                        })
                                    } else {
                                        doneOneSection();
                                    }
                                })
                            } else {
                                doneOneSection();
                            }
                        })
                    }, function doneAllSections() {
                        j++;
                        loadQuestionInformation(element, array, j, doneOneElement)
                    })
                } else {
                    console.log('loinc # does not match. Section');
                    console.log('element["LOINC#"]: ' + element['LOINC#']);
                    console.log('loincText: ' + loincText.trim());
                    process.exit(1);
                }
            });
        }
    }, function doneAllElements() {
        cb();
    });
}

exports.parseQuestion = function (driver, obj, cb) {
    var xpath = 'html/body/div[@class="Section2"]/*';
    driver.findElements(By.xpath(xpath)).then(function (elements) {
        var array = [];
        var item = [];
        var i = 0;
        async.forEachSeries(elements, function (element, doneOneDiv) {
            element.getAttribute('class').then(function (classes) {
                if (classes.indexOf('half_space') === -1) {
                    if (i === 0) {
                        element.getText().then(function (text) {
                            item.push(element);
                            i++;
                        })
                    } else {
                        item.push(element);
                        i++;
                    }
                } else {
                    array.push(item);
                    item = [];
                    i = 0;
                }
                doneOneDiv();
            })
        }, function doneAllDivs() {
            array.push(item);
            var newArray = array.filter(function (item) {
                return item.length > 2;
            });
            loadQuestionInformation(obj['PANEL HIERARCHY']['PANEL HIERARCHY'], newArray, 0, cb);
        })
    })
};