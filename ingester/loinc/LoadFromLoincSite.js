var async = require('async'),
    webdriver = require('selenium-webdriver'),
    MigrationLoincModal = require('../createConnection').MigrationLoincModal
    ;

var loincCount = 0;

var url_prefix = 'http://r.details.loinc.org/LOINC/';
var url_postfix = '.html';
var url_postfix_para = '?sections=Comprehensive';

var map = {
    "LOINC#": {
        function: parsingLOINCTable,
        xpath: '//*[@class="Section1"]/table[contains(@class,"bordered_table")]'
    },
    'NAME': {
        function: parsingNameTable,
        xpath: '//*[@class="Section1000000F00"]/table'
    },
    'TERM DEFINITION/DESCRIPTION(S)': {
        function: parsingTermDefinitionDescriptionsTable,
        xpath: '//div[@class="Section0"]/table[.//th[contains(text(),"TERM DEFINITION/DESCRIPTION(S)")]]'
    },
    'PART DEFINITION/DESCRIPTION(S)': {
        function: parsingPartDefinitionDescriptionsTable,
        xpath: '//*[@class="Section0"]/table[.//th[contains(text(),"PART DEFINITION/DESCRIPTION(S)")]]'
    },
    'BASIC ATTRIBUTES': {
        function: parsingBasicAttributesTable,
        xpath: '//*[@class="Section1000000F00"]/table'
    },
    'NORMATIVE ANSWER LIST': {
        function: parsingAnswerListTable,
        xpath: '//*[@class="Section80000"]/table[.//th[contains(node(),"NORMATIVE ANSWER LIST")]]'
    },
    'PREFERRED ANSWER LIST': {
        function: parsingAnswerListTable,
        xpath: '//*[@class="Section80000"]/table[.//th[contains(node(),"PREFERRED ANSWER LIST")]]'
    },
    'SURVEY QUESTION': {
        function: parsingSurveyQuestionTable,
        xpath: '//*[@class="Section200000"]/table'
    },
    'MEMBER OF THESE PANELS': {
        function: parsingMemberOfThesePanelsTable,
        xpath: '//*[@class="Section2000000"]/table'
    },
    'LANGUAGE VARIANTS': {
        function: parsingLanguageVariantsTable,
        xpath: '//*[@class="Section10000000"]/table'
    },
    'RELATED NAMES': {
        function: parsingRelatedNamesTable,
        xpath: '//*[@class="Section20000000"]/table'
    },
    'EXAMPLE UNITS': {
        function: parsingExampleUnitsTable,
        xpath: '//*[@class="Section40000000"]/table'
    },
    'EXAMPLE UNITS': {
        function: parsingExampleUnitsTable,
        xpath: '//*[@class="Section40000000"]/table'
    }
};

function logMessage(obj, messange) {
    obj['info'] = obj['info'] + messange + '\n';
}

function parsingLOINCTable(driver, loincId, sectionName, obj, cb) {
    cb();
}

function parsingLoincNameTable(driver, loincId, sectionName, obj, cb) {
    driver.findElements(webdriver.By.xpath('//*[@class="Section40000000000000"]')).then(function (divs) {
        if (divs.length === 0) {
            logMessage(obj, 'No loinc name found');
            cb();
        } else if (divs.length > 0) {
            if (divs.length > 1) logMessage(obj, 'More than one loinc name found');
            divs[0].getText().then(function (text) {
                obj[sectionName] = text.trim();
                cb();
            });
        }
    });
}

function parsingNameTable(obj, sectionName, table, cb) {
    obj[sectionName] = {};
    var nameObj = obj[sectionName];
    table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
        async.parallel([
            function (cb) {
                trs[1].findElements(webdriver.By.xpath('td')).then(function (tds) {
                    tds[2].findElements(webdriver.By.xpath('table/tbody/tr')).then(function (innerTrs) {
                        if (innerTrs) {
                            nameObj['Fully-Specified Name'] = {};
                            innerTrs[1].findElements(webdriver.By.xpath('td')).then(function (innerTds) {
                                async.parallel([
                                    function (innerCb) {
                                        innerTds[0].getText().then(function (text) {
                                            nameObj['Fully-Specified Name']['Component'] = text.trim();
                                            innerCb();
                                        });
                                    },
                                    function (innerCb) {
                                        innerTds[1].getText().then(function (text) {
                                            nameObj['Fully-Specified Name']['Property'] = text.trim();
                                            innerCb();
                                        });
                                    },
                                    function (innerCb) {
                                        innerTds[2].getText().then(function (text) {
                                            nameObj['Fully-Specified Name']['Time'] = text.trim();
                                            innerCb();
                                        });
                                    },
                                    function (innerCb) {
                                        innerTds[3].getText().then(function (text) {
                                            nameObj['Fully-Specified Name']['System'] = text.trim();
                                            innerCb();
                                        });
                                    },
                                    function (innerCb) {
                                        innerTds[4].getText().then(function (text) {
                                            nameObj['Fully-Specified Name']['Scale'] = text.trim();
                                            innerCb();
                                        });
                                    },
                                    function (innerCb) {
                                        innerTds[5].getText().then(function (text) {
                                            nameObj['Fully-Specified Name']['Method'] = text.trim();
                                            innerCb();
                                        });
                                    }
                                ], function () {
                                    cb();
                                });
                            });
                        } else {
                            tds[3].getText().then(function (text) {
                                nameObj['Fully-Specified Name'] = text.trim();
                                cb();
                            });
                        }
                    });
                });
            },
            function (cb) {
                trs[2].findElements(webdriver.By.xpath('td')).then(function (tds) {
                    tds[2].getText().then(function (text) {
                        nameObj['Long Common Name'] = text.trim();
                        cb();
                    });
                });
            },
            function (cb) {
                trs[3].findElements(webdriver.By.xpath('td')).then(function (tds) {
                    tds[2].getText().then(function (text) {
                        nameObj['Shortname'] = text.trim();
                        cb();
                    });
                });
            }
        ], function () {
            cb();
        });
    });
}

function parsingTermDefinitionDescriptionsTable(obj, sectionName, table, cb) {
    obj[sectionName] = {};
    var termDefinitionDescriptionsObj = obj[sectionName];
    table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        async.parallel([
            function (done) {
                trs[0].getText().then(function (text) {
                    termDefinitionDescriptionsObj['Description'] = text.trim();
                    done();
                });
            },
            function (done) {
                trs[1].getText().then(function (text) {
                    termDefinitionDescriptionsObj['Source'] = text.trim();
                    done();
                });
            }
        ], function () {
            cb();
        });
    });
}

function parsingPartDefinitionDescriptionsTable(obj, sectionName, table, cb) {
    obj[sectionName] = [];
    var partDefinitionDescriptionsArray = obj[sectionName];
    table.findElements(webdriver.By.xpath('tbody/tr[not(contains(@class,"half_space"))]')).then(function (trs) {
        trs.shift();
        var definitionArray = [];
        for (var i = 0; i < trs.length / 2; i++) {
            definitionArray.push({
                Definition: trs[2 * i],
                Source: trs[2 * i + 1]
            });
        }
        async.forEach(definitionArray, function (definition, doneOneDefinition) {
            var partDefinitionDescriptionsObj = {};
            async.parallel([
                function (cb) {
                    definition.Definition.getText().then(function (text) {
                        partDefinitionDescriptionsObj['Description'] = text.trim();
                        cb();
                    });
                },
                function (cb) {
                    if (!definition.Source) return cb();

                    definition.Source.getText().then(function (text) {
                        partDefinitionDescriptionsObj['Source'] = text.trim();
                        cb();
                    });
                }
            ], function () {
                partDefinitionDescriptionsArray.push(partDefinitionDescriptionsObj);
                doneOneDefinition();
            });
        }, function () {
            cb();
        });
    });
}

function parsingBasicAttributesTable(obj, sectionName, table, cb) {
    obj[sectionName] = {};
    var basicAttributesObj = obj[sectionName];
    table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        async.forEach(trs, function (tr, doneOneTr) {
            tr.findElements(webdriver.By.xpath('td')).then(function (tds) {
                var key = '';
                var value = '';
                async.series([
                    function (doneKey) {
                        tds[0].getText().then(function (keyText) {
                            key = keyText.replace(/:/g, '').trim();
                            doneKey();
                        });
                    },
                    function (doneValue) {
                        tds[1].getText().then(function (valueText) {
                            value = valueText.trim();
                            doneValue();
                        });
                    }
                ], function () {
                    basicAttributesObj[key] = value;
                    doneOneTr();
                });
            });
        }, function doneAllTrs() {
            cb();
        });
    });
}

function parsingAnswerListTable(obj, sectionName, table, cb) {
    obj[sectionName] = {
        answerListId: {},
        answerList: []
    };
    var preferredAnswerListObj = obj[sectionName];
    var answerListIdObj = obj[sectionName].answerListId;
    var answerListArray = obj[sectionName].answerList;
    var externalDefinedExist = false;
    async.series([
        function (next) {
            table.findElements(webdriver.By.css('table')).then(function (innerTable) {
                if (innerTable.length > 0) {
                    externalDefinedExist = true;
                    innerTable[0].findElements(webdriver.By.xpath('tbody/tr')).then(function (innerTrs) {
                        async.forEach(innerTrs, function (innerTr, doneOneInnerTr) {
                            innerTr.findElements(webdriver.By.xpath('td')).then(function (tds) {
                                var key = '';
                                var value = '';
                                async.series([
                                    function (doneKey) {
                                        tds[0].getText().then(function (keyText) {
                                            key = keyText.replace(/:/g, '').trim();
                                            doneKey();
                                        });
                                    },
                                    function (doneValue) {
                                        tds[1].getText().then(function (valueText) {
                                            value = valueText.trim();
                                            doneValue();
                                        });
                                    }
                                ], function () {
                                    preferredAnswerListObj[key] = value;
                                    doneOneInnerTr();
                                });
                            });
                        }, function doneAllInnerTrs() {
                            next();
                        });
                    });
                }
                else {
                    next();
                }
            });
        },
        function (next) {
            table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
                async.series([
                    function (done) {
                        trs[0].findElement(webdriver.By.css('a')).then(function (a) {
                            async.parallel([
                                    function (doneHref) {
                                        a.getAttribute('href').then(function (urlText) {
                                            answerListIdObj.url = urlText.trim();
                                            doneHref();
                                        });
                                    },
                                    function (doneId) {
                                        a.getText().then(function (text) {
                                            answerListIdObj.id = text.trim();
                                            doneId();
                                        });
                                    }
                                ],
                                function () {
                                    done();
                                });
                        });
                    },
                    function (done) {
                        trs.shift();
                        if (externalDefinedExist) {
                            trs.shift();
                            done();
                        }
                        else {
                            done();
                        }
                    },
                    function (done) {
                        trs.shift();
                        async.forEach(trs, function (tr, doneOneTr) {
                            var answerListItem = {};
                            tr.findElements(webdriver.By.xpath('td')).then(function (tds) {
                                if (tds.length === 9) {
                                    async.parallel([
                                        function (doneParsingTd) {
                                            tds[1].getText().then(function (text) {
                                                answerListItem['SEQ#'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[3].getText().then(function (text) {
                                                answerListItem['Answer'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[5].getText().then(function (text) {
                                                answerListItem['Code'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[7].getText().then(function (text) {
                                                answerListItem['Answer ID'] = text.trim();
                                                doneParsingTd();
                                            });
                                        }
                                    ], function () {
                                        answerListArray.push(answerListItem);
                                        doneOneTr();
                                    });
                                }
                                else if (tds.length === 7) {
                                    async.parallel([
                                        function (doneParsingTd) {
                                            tds[1].getText().then(function (text) {
                                                answerListItem['SEQ#'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[3].getText().then(function (text) {
                                                answerListItem['Answer'] = text.trim();
                                                doneParsingTd();
                                            });
                                        },
                                        function (doneParsingTd) {
                                            tds[5].getText().then(function (text) {
                                                answerListItem['Answer ID'] = text.trim();
                                                doneParsingTd();
                                            });
                                        }
                                    ], function () {
                                        answerListArray.push(answerListItem);
                                        doneOneTr();
                                    });
                                } else {
                                    logMessage(obj, 'this answer list has different length');
                                    doneOneTr();
                                }


                            });
                        }, function doneAllTrs() {
                            done();
                        });
                    }
                ], function () {
                    next();
                });
            });
        }
    ], function () {
        cb();
    });
}

function parsingSurveyQuestionTable(obj, sectionName, table, cb) {
    obj[sectionName] = {};
    var surveyQuestionObj = obj[sectionName];
    table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        async.forEach(trs, function (tr, doneOneTr) {
            tr.findElements(webdriver.By.xpath('td')).then(function (tds) {
                tds[1].getText().then(function (keyText) {
                    tds[2].getText().then(function (valueText) {
                        surveyQuestionObj[keyText.replace(/:/g, '').trim()] = valueText.trim();
                        doneOneTr();
                    });
                });
            });
        }, function doneAllTrs() {
            cb();
        });
    });
}

function parsingMemberOfThesePanelsTable(obj, sectionName, table, cb) {
    obj[sectionName] = [];
    var memberOfThesePanelsObj = obj[sectionName];
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
                    memberOfThesePanelsObj.push(panel);
                    doneOneTr();
                });

            });
        }, function doneAllTrs() {
            cb();
        });
    });
}

function parsingLanguageVariantsTable(obj, sectionName, table, cb) {
    obj[sectionName] = [];
    var languageVariantsObj = obj[sectionName];
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
                languageVariantsObj.push(languageVariant);
                doneOneLanguage();
            });
        }, function () {
            cb();
        });
    });
}

function parsingRelatedNamesTable(obj, sectionName, table, cb) {
    obj[sectionName] = [];
    var relatedNamesObj = obj[sectionName];
    table.findElements(webdriver.By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        async.forEach(trs, function (tr, doneOneTr) {
            tr.findElements(webdriver.By.xpath('td')).then(function (tds) {
                tds.shift();
                async.forEach(tds, function (td, doneOneTd) {
                        td.getText().then(function (text) {
                            relatedNamesObj.push(text.trim());
                            doneOneTd();
                        });
                    },
                    function doneAllTds() {
                        doneOneTr();
                    });
            });
        }, function doneAllTrs() {
            cb();
        });
    });
}

function parsingExampleUnitsTable(obj, sectionName, table, cb) {
    obj[sectionName] = [];
    var exampleUnitsObj = obj[sectionName];
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
                    exampleUnitsObj.push(exampleUnit);
                    doneOneTr();
                });
            });
        }, function doneAllTrs() {
            cb();
        });
    });
}

function findTableAndParsing(driver, loincId, sectionName, obj, cb) {
    var xpath = map[sectionName].xpath;
    driver.findElements(webdriver.By.xpath(xpath)).then(function (tables) {
        if (tables && tables.length === 0) {
            var message = 'cannot find ' + sectionName + ' for loinc: ' + loincId;
            console.log(message);
            logMessage(obj, message);
            cb();
        } else {
            if (tables && tables.length > 1) console.log('find more than 1 ' + sectionName + ' for loinc: ' + loincId);
            else {
                map[sectionName].function(obj, sectionName, tables[0], cb);
            }
        }
    });
}

function parsingHtml(driver, loincId, cb) {
    var obj = {loincId: loincId, info: ''};
    async.parallel([
        function (doneParsing) {
            var sectionName = "LOINC#";
            parsingLOINCTable(driver, loincId, sectionName, obj, doneParsing);
        },
        function (doneParsing) {
            var sectionName = "LOINC NAME";
            parsingLoincNameTable(driver, loincId, sectionName, obj, doneParsing);
        },
        function (doneParsing) {
            var sectionName = "NAME";
            findTableAndParsing(driver, loincId, sectionName, obj, doneParsing);
        },
        function (doneParsing) {
            var sectionName = "TERM DEFINITION/DESCRIPTION(S)";
            findTableAndParsing(driver, loincId, sectionName, obj, doneParsing);
        },
        function (doneParsing) {
            var sectionName = "PART DEFINITION/DESCRIPTION(S)";
            findTableAndParsing(driver, loincId, sectionName, obj, doneParsing);
        },
        function (doneParsing) {
            var sectionName = "BASIC ATTRIBUTES";
            findTableAndParsing(driver, loincId, sectionName, obj, doneParsing);
        },
        function (doneParsing) {
            var sectionName = "NORMATIVE ANSWER LIST";
            findTableAndParsing(driver, loincId, sectionName, obj, doneParsing);
        },
        function (doneParsing) {
            var sectionName = "PREFERRED ANSWER LIST";
            findTableAndParsing(driver, loincId, sectionName, obj, doneParsing);
        },
        function (doneParsing) {
            var sectionName = "SURVEY QUESTION";
            findTableAndParsing(driver, loincId, sectionName, obj, doneParsing);
        },
        function (doneParsing) {
            var sectionName = "MEMBER OF THESE PANELS";
            findTableAndParsing(driver, loincId, sectionName, obj, doneParsing);
        },
        function (doneParsing) {
            var sectionName = "LANGUAGE VARIANTS";
            findTableAndParsing(driver, loincId, sectionName, obj, doneParsing);
        },
        function (doneParsing) {
            var sectionName = "RELATED NAMES";
            findTableAndParsing(driver, loincId, sectionName, obj, doneParsing);
        },
        function (doneParsing) {
            var sectionName = "EXAMPLE UNITS";
            findTableAndParsing(driver, loincId, sectionName, obj, doneParsing);
        }
    ], function () {
        cb(obj);
    });
}

exports.runArray = function (loincIdArray, removeMigration, next) {
    async.series([
        function (cb) {
            if (removeMigration) {
                MigrationLoincModal.remove({}, function (err) {
                    if (err) throw err;
                    console.log('removed migration loinc collection.');
                    cb();
                });
            }
            else {
                console.log('do not remove migration loinc collection.');
                cb();
            }
        },
        function (cb) {
            var driver = new webdriver.Builder().forBrowser('chrome').build();
            async.forEach(loincIdArray, function (loincId, doneOneLoinc) {
                MigrationLoincModal.find({loincId: loincId}).exec(function (err, existingLoincs) {
                    if (err) throw err;
                    if (existingLoincs.length === 0) {
                        var url = url_prefix + loincId.trim() + url_postfix + url_postfix_para;
                        driver.get(url).then(function () {
                            parsingHtml(driver, loincId, function (obj) {
                                new MigrationLoincModal(obj).save(function (e) {
                                    if (e) throw e;
                                    loincCount++;
                                    console.log('loincCount: ' + loincCount);
                                    doneOneLoinc();
                                });
                            });
                        });
                    } else if (existingLoincs > 0) {
                        console.log('already exist loincId: ' + obj.loincId + ' in migration loinc.');
                        doneOneLoinc();
                    }
                });
            }, function doneAllLoinc() {
                console.log('finished all');
                cb();
            });
        },
        function () {
            if (next) next();
            else process.exit(1);
        }
    ]);
};

exports.runOne = function (loincId, next) {
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
            var url = url_prefix + loincId.trim() + url_postfix + url_postfix_para;
            driver.get(url).then(function () {
                parsingHtml(driver, loincId, function (obj) {
                    new MigrationLoincModal(obj).save(function () {
                        driver.quit();
                        cb();
                    });
                });
            });
        },
        function () {
            if (next) next();
            else process.exit(1);
        }
    ]);
};