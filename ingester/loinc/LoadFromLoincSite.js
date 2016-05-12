var async = require('async'),
    webdriver = require('selenium-webdriver'),
    MigrationLoincModal = require('../createConnection').MigrationLoincModal
    ;

var testArray = ['66067-0', '79723-3', '79724-1'];

var url_prefix = 'http://r.details.loinc.org/LOINC/';
var url_postfix = '.html';
var url_postfix_para = '?sections=Comprehensive';

function parsingName(doneParsing, driver, obj) {
    driver.findElement(webdriver.By.xpath("//*[@class='Section1000000F00']/table")).then(function (table) {
        if (table !== undefined) {
            obj.name = {};
            table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
                async.parallel([
                    function (cb) {
                        trs[1].findElements(webdriver.By.xpath('td')).then(function (tds) {
                            tds[2].findElements(webdriver.By.xpath('table/tbody/tr')).then(function (innerTrs) {
                                if (innerTrs) {
                                    obj.name['Fully-Specified Name'] = {};
                                    innerTrs[1].findElements(webdriver.By.xpath('td')).then(function (innerTds) {
                                        async.parallel([
                                            function (innerCb) {
                                                innerTds[0].getText().then(function (text) {
                                                    obj.name['Fully-Specified Name']['Component'] = text.trim();
                                                    innerCb();
                                                });
                                            },
                                            function (innerCb) {
                                                innerTds[1].getText().then(function (text) {
                                                    obj.name['Fully-Specified Name']['Property'] = text.trim();
                                                    innerCb();
                                                });
                                            },
                                            function (innerCb) {
                                                innerTds[2].getText().then(function (text) {
                                                    obj.name['Fully-Specified Name']['Time'] = text.trim();
                                                    innerCb();
                                                });
                                            },
                                            function (innerCb) {
                                                innerTds[3].getText().then(function (text) {
                                                    obj.name['Fully-Specified Name']['System'] = text.trim();
                                                    innerCb();
                                                });
                                            },
                                            function (innerCb) {
                                                innerTds[4].getText().then(function (text) {
                                                    obj.name['Fully-Specified Name']['Scale'] = text.trim();
                                                    innerCb();
                                                });
                                            },
                                            function (innerCb) {
                                                innerTds[5].getText().then(function (text) {
                                                    obj.name['Fully-Specified Name']['Method'] = text.trim();
                                                    innerCb();
                                                });
                                            }
                                        ], function () {
                                            cb();
                                        });
                                    });
                                } else {
                                    tds[3].getText().then(function (text) {
                                        obj.name['Fully-Specified Name'] = text.trim();
                                        cb();
                                    });
                                }
                            });
                        });
                    },
                    function (cb) {
                        trs[2].findElements(webdriver.By.xpath('td')).then(function (tds) {
                            tds[2].getText().then(function (text) {
                                obj.name['Long Common Name'] = text.trim();
                                cb();
                            });
                        });
                    },
                    function (cb) {
                        trs[3].findElements(webdriver.By.xpath('td')).then(function (tds) {
                            tds[2].getText().then(function (text) {
                                obj.name['Shortname'] = text.trim();
                                cb();
                            });
                        });
                    }
                ], function () {
                    doneParsing();
                });
            });
        } else {
            console.log('cannot find NAME');
            doneParsing();
        }
    });
}
function parsingBasicAttributes(doneParsing, driver, obj) {
    driver.findElement(webdriver.By.xpath("//*[@class='Section8000']/table")).then(function (table) {
        if (table !== undefined) {
            obj['BASIC ATTRIBUTES'] = {};
            table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
                trs.shift();
                async.forEach(trs, function (tr, doneOneTr) {
                    tr.findElements(webdriver.By.xpath('td')).then(function (tds) {
                        tds[1].getText().then(function (keyText) {
                            tds[2].getText().then(function (valueText) {
                                obj['BASIC ATTRIBUTES'][keyText.replace(/:/g, '').trim()] = valueText.trim();
                                doneOneTr();
                            });
                        });
                    });
                }, function doneAllTrs() {
                    doneParsing();
                });
            });
        } else {
            console.log('cannot find BASIC ATTRIBUTES');
            doneParsing();
        }
    });
}
function parsingSurveyQuestion(doneParsing, driver, obj) {
    driver.findElement(webdriver.By.xpath("//*[@class='Section200000']/table")).then(function (table) {
        if (table !== undefined) {
            obj['SURVEY QUESTION'] = {};
            table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
                trs.shift();
                async.forEach(trs, function (tr, doneOneTr) {
                    tr.findElements(webdriver.By.xpath('td')).then(function (tds) {
                        tds[1].getText().then(function (keyText) {
                            tds[2].getText().then(function (valueText) {
                                obj['SURVEY QUESTION'][keyText.replace(/:/g, '').trim()] = valueText.trim();
                                doneOneTr();
                            });
                        });
                    });
                }, function doneAllTrs() {
                    doneParsing();
                });
            });
        } else {
            console.log('cannot find SURVEY QUESTION');
            doneParsing();
        }
    });
}
function parsingMemberOfThesePanels(doneParsing, driver, obj) {
    driver.findElement(webdriver.By.xpath("//*[@class='Section2000000']/table")).then(function (table) {
        if (table !== undefined) {
            obj['MEMBER OF THESE PANELS'] = [];
            table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
                trs.shift();
                async.forEach(trs, function (tr, doneOneTr) {
                    var panel = {};
                    tr.findElements(webdriver.By.xpath('td')).then(function (tds) {
                        async.parallel([
                            function (cb) {
                                tds[1].getText().then(function (idText) {
                                    panel.id = idText.trim();
                                    cb();
                                });
                            },
                            function (cb) {
                                tds[2].getText().then(function (panelNameText) {
                                    panel.panelName = panelNameText.trim();
                                    cb();
                                });
                            },
                            function (cb) {
                                tds[1].findElement(webdriver.By.xpath('a')).then(function (a) {
                                    a.getAttribute('href').then(function (urlText) {
                                        panel.url = urlText.trim();
                                        cb();
                                    });
                                });
                            }
                        ], function () {
                            obj['MEMBER OF THESE PANELS'].push(panel);
                            doneOneTr();
                        });

                    });
                }, function doneAllTrs() {
                    doneParsing();
                });
            });
        } else {
            console.log('cannot find MEMBER OF THESE PANELS');
            doneParsing();
        }
    });
}
function parsingLanguageVariants(doneParsing, driver, obj) {
    driver.findElement(webdriver.By.xpath("//*[@class='Section10000000']/table")).then(function (table) {
        if (table !== undefined) {
            obj['LANGUAGE VARIANTS'] = [];
            table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
                trs.shift();
                var languageArray = [];
                for (var i = 0; i < trs.length / 2; i++) {
                    languageArray.push({
                        languageTitle: trs[2 * i],
                        languageDetail: trs[2 * i + 1]
                    });
                }
                async.forEach(languageArray, function (languge, doneOneLanguage) {
                    var languageVariant = {};
                    async.parallel([
                        function (cb) {
                            languge.languageTitle.getText().then(function (text) {
                                languageVariant.variantKey = text.trim();
                                cb();
                            });
                        },
                        function (cb) {
                            languge.languageDetail.getText().then(function (text) {
                                languageVariant.variantValue = text.trim();
                                cb();
                            });
                        }
                    ], function () {
                        obj['LANGUAGE VARIANTS'].push(languageVariant);
                        doneOneLanguage();
                    });
                }, function () {
                    doneParsing();
                });
            });
        } else {
            console.log('cannot find LANGUAGE VARIANTS');
            doneParsing();
        }
    });
}
function parsingRelatedNames(doneParsing, driver, obj) {
    driver.findElement(webdriver.By.xpath("//*[@class='Section20000000']/table")).then(function (table) {
        if (table !== undefined) {
            obj['RELATED NAMES'] = [];
            table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
                trs.shift();
                async.forEach(trs, function (tr, doneOneTr) {
                    tr.findElements(webdriver.By.xpath('td')).then(function (tds) {
                        tds.shift();
                        async.forEach(tds, function (td, doneOneTd) {
                                td.getText().then(function (text) {
                                    obj['RELATED NAMES'].push(text.trim());
                                    doneOneTd();
                                });
                            },
                            function doneAllTds() {
                                doneOneTr();
                            });
                    });
                }, function doneAllTrs() {
                    doneParsing();
                });
            });
        } else {
            console.log('cannot find RELATED NAMES');
            doneParsing();
        }
    });
}
function parsingExampleUnits(doneParsing, driver, obj) {

    driver.findElement(webdriver.By.xpath("//*[@class='Section40000000']/table")).then(function (table) {
        if (table !== undefined) {
            obj['EXAMPLE UNITS'] = [];
            table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
                trs.shift();
                trs.shift();
                async.forEach(trs, function (tr, doneOneTr) {
                    var exampleUnit = {};
                    tr.findElements(webdriver.By.xpath('td')).then(function (tds) {
                        async.parallel([
                            function (cb) {
                                tds[1].getText().then(function (unitText) {
                                    exampleUnit.Unit = unitText.trim();
                                    cb();
                                });
                            },
                            function (cb) {
                                tds[2].getText().then(function (sourceTypeText) {
                                    exampleUnit['Source Type'] = sourceTypeText.trim();
                                    cb();
                                });
                            }
                        ], function () {
                            obj['EXAMPLE UNITS'].push(exampleUnit);
                            doneOneTr();
                        });
                    });
                }, function doneAllTrs() {
                    doneParsing();
                });
            });
        } else {
            console.log('cannot find EXAMPLE UNITS');
            doneParsing();
        }
    });
}

function parsingHtml(driver, cb) {
    var obj = {};
    async.parallel([
        function (doneParsing) {
            parsingName(doneParsing, driver, obj);
        },
        function (doneParsing) {
            parsingBasicAttributes(doneParsing, driver, obj);
        },
        function (doneParsing) {
            parsingSurveyQuestion(doneParsing, driver, obj);
        },
        function (doneParsing) {
            parsingMemberOfThesePanels(doneParsing, driver, obj);
        },
        function (doneParsing) {
            parsingLanguageVariants(doneParsing, driver, obj);
        },
        function (doneParsing) {
            parsingRelatedNames(doneParsing, driver, obj);
        },
        function (doneParsing) {
            parsingExampleUnits(doneParsing, driver, obj);
        }
    ], function () {
        cb(obj);
    });
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
            async.forEach(loincArray, function (loinc, doneOneLoinc) {
                var url = url_prefix + loinc.trim() + url_postfix + url_postfix_para;
                driver.get(url).then(function () {
                    parsingHtml(driver, function (obj) {
                        new MigrationLoincModal(obj).save(function () {
                            doneOneLoinc();
                        });
                    });
                });
            }, function doneAllLoinc() {
                console.log('finished all');
                cb();
            });
        }
    ]);
}

run(testArray);