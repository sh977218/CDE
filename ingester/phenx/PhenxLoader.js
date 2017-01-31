var webdriver = require('selenium-webdriver');
var mongoose = require('mongoose');
var async = require('async');
var classificationShared = require('../../modules/system/shared/classificationShared');
var mongo_data_system = require('../../modules/system/node-js/mongo-data');
var OrgModel = mongo_data_system.Org;
var mongo_cde = require('../../modules/cde/node-js/mongo-cde');
var mongo_form = require('../../modules/form/node-js/mongo-form');
var baseUrl = require('../createMigrationConnection').PhenxURL;
var Measure = require('../createMigrationConnection').MigrationMeasureModel;
var DataElement = require('../createMigrationConnection').MigrationDataElementModel;
var Cache = require('../createMigrationConnection').MigrationCacheModel;

var phenxOrg = null;
var nciOrg = null;

var remoteGrabFromPhenX = function (doneStep1) {
    var log = {};
    var protocolCounter = 0;
    var measureCounter = 0;
    var measureXpath = "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td/div/div/a[2]";
    var driver = new webdriver.Builder().forBrowser('chrome').build();
    var driver1 = new webdriver.Builder().forBrowser('chrome').build();
    var driver2 = new webdriver.Builder().forBrowser('chrome').build();
    var driver3 = new webdriver.Builder().forBrowser('chrome').build();
    var driver4 = new webdriver.Builder().forBrowser('chrome').build();
    driver.get(baseUrl);
    driver.findElements(webdriver.By.xpath(measureXpath)).then(function (measureLinks) {
            async.eachSeries(measureLinks, function (measureLink, doneOneMeasureLink) {
                var measure = {};
                async.series([
                        function parsingMeasureBrowseId(doneParsingMeasureBrowserId) {
                            measureLink.findElement(webdriver.By.css('span')).getText().then(function (browserIdText) {
                                measure['browserId'] = browserIdText.replace('#', '').trim();
                                doneParsingMeasureBrowserId();
                            });
                        },
                        function parsingMeasureHref(doneParsingMeasureHref) {
                            measureLink.getAttribute('href').then(function (hrefText) {
                                measure['href'] = hrefText.trim();
                                doneParsingMeasureHref();
                            });
                        },
                        function goToMeasure(doneGoToMeasure) {
                            driver1.get(measure.href);
                            async.series([
                                    function parsingMeasureIntroduction(doneParsingMeasureIntroduction) {
                                        driver1.findElement(webdriver.By.xpath('/html/body/center/table/tbody/tr[3]/td/div/div[5]/div[1]')).getText().then(function (text) {
                                            measure.introduction = text.trim();
                                            doneParsingMeasureIntroduction();
                                        });
                                    },
                                    function parsingMeasureClassifiction(doneParsingMeasureClassification) {
                                        driver1.findElements(webdriver.By.xpath("//p[@class='back'][1]/a")).then(function (classificationArr) {
                                            if (classificationArr.length > 0) {
                                                var classification = [];
                                                async.eachSeries(classificationArr, function (c, doneOneC) {
                                                    c.getText().then(function (text) {
                                                        classification.push(text.trim());
                                                        doneOneC();
                                                    });
                                                }, function doneAllC() {
                                                    var classi = [{
                                                        stewardOrg: {name: "PhenX"},
                                                        elements: []
                                                    }];
                                                    var temp = classi[0].elements;
                                                    for (var i = 0; i < classification.length; i++) {
                                                        var ele = {
                                                            name: classification[i],
                                                            elements: []
                                                        };
                                                        temp.push(ele);
                                                        temp = temp[0].elements;
                                                    }
                                                    measure.classification = classi;
                                                    classificationShared.addCategory({elements: phenxOrg.classifications}, classification);
                                                    phenxOrg.save(function (err) {
                                                        if (err) throw err;
                                                        doneParsingMeasureClassification();
                                                    });
                                                });
                                            } else {
                                                doneParsingMeasureClassification();
                                            }
                                        });
                                    },
                                    function parsingMeasureProtocol(doneParsingMeasureProtocol) {
                                        var protocols = [];
                                        driver1.findElements(webdriver.By.xpath("//*[@id='browse_measure_protocol_list']/table/tbody/tr/td/div/div[@class='search']/a[2]")).then(function (protocolLinks) {
                                            async.eachSeries(protocolLinks, function (protocolLink, doneOneProtocolLink) {
                                                protocolLink.getAttribute('href').then(function (text) {
                                                    var protocol = {
                                                        classification: measure.classification,
                                                        href: text.trim()
                                                    };
                                                    driver2.get(protocol.href);
                                                    driver2.findElement(webdriver.By.id('button_showfull')).click().then(function () {
                                                        driver2.findElements(webdriver.By.xpath("//*[contains(@id,'label')]")).then(function (labels) {
                                                            async.eachSeries(labels, function (label, doneOneLabel) {
                                                                label.getAttribute('id').then(function (id) {
                                                                    label.getText().then(function (key) {
                                                                        var newId = id.replace('label', 'element');
                                                                        if (newId.indexOf('STANDARDS') > -1) {
                                                                            var standards = [];
                                                                            driver2.findElements(webdriver.By.xpath("//*[@id='" + newId + "']//table/tbody/tr[td]")).then(function (trs) {
                                                                                async.eachSeries(trs, function (tr, doneOneStandardsTr) {
                                                                                    var standard = {};
                                                                                    tr.findElements(webdriver.By.css('td')).then(function (tds) {
                                                                                        async.parallel({
                                                                                            parsingStandard: function (doneParsingStandard) {
                                                                                                tds[0].getText().then(function (text) {
                                                                                                    standard['Standard'] = text;
                                                                                                    doneParsingStandard();
                                                                                                });
                                                                                            },
                                                                                            parsingName: function (doneParsingName) {
                                                                                                tds[1].getText().then(function (text) {
                                                                                                    standard['Name'] = text;
                                                                                                    doneParsingName();
                                                                                                });
                                                                                            },
                                                                                            parsingId: function (doneParsingId) {
                                                                                                tds[2].getText().then(function (text) {
                                                                                                    standard['ID'] = text;
                                                                                                    doneParsingId();
                                                                                                });
                                                                                            },
                                                                                            parsingSource: function (doneParsingSource) {
                                                                                                var source = {};
                                                                                                tds[3].getText().then(function (text) {
                                                                                                    source.text = text.trim();
                                                                                                    if (text.trim() === 'LOINC') {
                                                                                                        tds[3].findElement(webdriver.By.css('a')).then(function (a) {
                                                                                                            a.getAttribute('href').then(function (href) {
                                                                                                                source.href = href.trim();
                                                                                                                var form = {
                                                                                                                    classification: protocol.classification
                                                                                                                };
                                                                                                                driver3.get(source['href']);
                                                                                                                driver3.findElements(webdriver.By.xpath("/html/body/div[2]/table[2]/tbody/tr[.//a]")).then(function (temp) {
                                                                                                                    if (temp.length > 0) {
                                                                                                                        var elements = [];
                                                                                                                        var i = 0;
                                                                                                                        async.eachSeries(temp, function (tr, doneOneTr) {
                                                                                                                            var element = {};
                                                                                                                            i++;
                                                                                                                            async.parallel({
                                                                                                                                parsingFormAndElementName: function (doneParsingFormAndElementName) {
                                                                                                                                    tr.findElements(webdriver.By.css('td')).then(function (tds) {
                                                                                                                                        if (tds.length > 0) {
                                                                                                                                            if (i === 1) {
                                                                                                                                                tds[2].getText().then(function (elementNameText) {
                                                                                                                                                    form['name'] = elementNameText.trim();
                                                                                                                                                    doneParsingFormAndElementName();
                                                                                                                                                });
                                                                                                                                            }
                                                                                                                                            else {
                                                                                                                                                tds[2].getText().then(function (elementNameText) {
                                                                                                                                                    element['name'] = elementNameText.trim();
                                                                                                                                                    doneParsingFormAndElementName();
                                                                                                                                                });
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                        else {
                                                                                                                                            doneParsingFormAndElementName();
                                                                                                                                        }
                                                                                                                                    });
                                                                                                                                },
                                                                                                                                parsingLinks: function (doneParsingLink) {
                                                                                                                                    tr.findElement(webdriver.By.css('a')).getAttribute('href').then(function (elementHrefText) {
                                                                                                                                        if (i === 1) {
                                                                                                                                            form['href'] = elementHrefText.trim();
                                                                                                                                        }
                                                                                                                                        else {
                                                                                                                                            element['href'] = elementHrefText.trim();
                                                                                                                                        }
                                                                                                                                        doneParsingLink();
                                                                                                                                    });
                                                                                                                                },
                                                                                                                                parsingLoincId: function (doneParsingLoinc) {
                                                                                                                                    tr.findElement(webdriver.By.css('a')).getText().then(function (elementHrefText) {
                                                                                                                                        if (i === 1) {
                                                                                                                                            form['loincId'] = elementHrefText.trim();
                                                                                                                                        }
                                                                                                                                        else {
                                                                                                                                            element['loincId'] = elementHrefText.trim();
                                                                                                                                        }
                                                                                                                                        doneParsingLoinc();
                                                                                                                                    });
                                                                                                                                }
                                                                                                                            }, function doneAllHref() {
                                                                                                                                if (i !== 1)
                                                                                                                                    elements.push(element);
                                                                                                                                doneOneTr();
                                                                                                                            });
                                                                                                                        }, function doneAllTrs() {
                                                                                                                            async.eachSeries(elements, function (ele, doneOneEle) {
                                                                                                                                ele['classification'] = form['classification'];
                                                                                                                                var eleHref = ele['href'];
                                                                                                                                driver4.get(eleHref);
                                                                                                                                driver4.findElements(webdriver.By.xpath("/html/body/div[2]/table[1]/tbody/tr[1]/th/a")).then(function (isPanel) {
                                                                                                                                    if (isPanel.length > 0) {
                                                                                                                                        ele['type'] = 'Panel';
                                                                                                                                        doneOneEle();
                                                                                                                                    }
                                                                                                                                    else {
                                                                                                                                        ele['type'] = 'Question';
                                                                                                                                        doneOneEle();
                                                                                                                                    }
                                                                                                                                });
                                                                                                                            }, function doneAllEles() {
                                                                                                                                form['elements'] = elements;
                                                                                                                                protocol['form'] = form;
                                                                                                                                standard['Source'] = source;
                                                                                                                                doneParsingSource();
                                                                                                                            });
                                                                                                                        });

                                                                                                                    }
                                                                                                                    else {
                                                                                                                        protocol['form'] = form;
                                                                                                                        standard['Source'] = source;
                                                                                                                        doneParsingSource();
                                                                                                                    }

                                                                                                                });

                                                                                                            });
                                                                                                        });
                                                                                                    } else {
                                                                                                        standard['Source'] = source;
                                                                                                        doneParsingSource();
                                                                                                    }
                                                                                                });
                                                                                            }
                                                                                        }, function doneAllStandardsTds() {
                                                                                            standards.push(standard);
                                                                                            doneOneStandardsTr();
                                                                                        });
                                                                                    });
                                                                                }, function doneAllStandardsTrs() {
                                                                                    protocol['Standards'] = standards;
                                                                                    doneOneLabel();
                                                                                });
                                                                            });
                                                                        }
                                                                        else if (newId.indexOf('PROTOCOL_TEXT') > -1 || newId.indexOf('Requirements') > -1 || newId.indexOf('SPECIFIC_INSTRUCTIONS') > -1) {
                                                                            driver2.findElements(webdriver.By.xpath("//*[@id='" + newId + "']")).then(function (temp) {
                                                                                if (temp.length > 0) {
                                                                                    temp[0].getOuterHtml().then(function (html) {
                                                                                        protocol[key.trim()] = html;
                                                                                        doneOneLabel();
                                                                                    });
                                                                                }
                                                                                else
                                                                                    doneOneLabel();
                                                                            });
                                                                        }
                                                                        else {
                                                                            driver2.findElement(webdriver.By.id(newId)).getText().then(function (text) {
                                                                                protocol[key.trim()] = text;
                                                                                doneOneLabel();
                                                                            });
                                                                        }
                                                                    });
                                                                });
                                                            }, function donAllLabels() {
                                                                driver2.findElements(webdriver.By.xpath("//*[@class='back'][1]/a")).then(function (temp) {
                                                                    if (temp.length > 0) {
                                                                        temp[temp.length - 1].getText().then(function (text) {
                                                                            protocol['Protocol Name'] = text.trim();
                                                                            driver2.findElements(webdriver.By.xpath("/html/body/center/table/tbody/tr[3]/td/div/div[3]/div[1]/span")).then(function (protocolIdTemp) {
                                                                                if (protocolIdTemp.length > 0) {
                                                                                    protocolIdTemp[0].getText().then(function (protocolIdText) {
                                                                                        protocol['protocolId'] = protocolIdText.replace('#', '').trim();
                                                                                        protocolCounter++;
                                                                                        protocols.push(protocol);
                                                                                        console.log('finished protocol ' + protocolCounter);
                                                                                        doneOneProtocolLink();
                                                                                    });
                                                                                }
                                                                                else {
                                                                                    protocolCounter++;
                                                                                    protocols.push(protocol);
                                                                                    console.log('finished protocol ' + protocolCounter);
                                                                                    doneOneProtocolLink();
                                                                                }
                                                                            });
                                                                        });
                                                                    }
                                                                    else {
                                                                        protocolCounter++;
                                                                        protocols.push(protocol);
                                                                        console.log('finished protocol ' + protocolCounter);
                                                                        doneOneProtocolLink();
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            }, function doneAllProtocolLinks() {
                                                measure['protocols'] = protocols;
                                                doneParsingMeasureProtocol();
                                            });
                                        });
                                    }
                                ],
                                function doneParsingAllMeasureDetails() {
                                    doneGoToMeasure();
                                }
                            );
                        }
                    ],
                    function doneAllMeasureParsing(err) {
                        if (err) throw err;
                        measure.step1 = 'done';
                        var newMeasure = new Measure(measure);
                        newMeasure.save(function () {
                            measureCounter++;
                            console.log("finished measure " + measureCounter);
                            doneOneMeasureLink();
                        });
                    });
            }, function doneAllMeasureLinks() {
                log['protocolCounter'] = protocolCounter;
                log['measureCounter'] = measureCounter;
                var cache = new Cache(log);
                cache.save(function () {
                    driver.quit();
                    driver1.quit();
                    driver2.quit();
                    driver3.quit();
                    driver4.quit();
                    console.log('saved log into cache');
                    doneStep1();
                });
            });
        }
    );
};

var parsingQuestion = function (driver4, ele, doneOneEle) {
    driver4.get(ele['href']);
    driver4.findElements(webdriver.By.xpath("/html/body/div[2]/table[1]/tbody/tr[1]/th")).then(function () {
        var naming = [];
        var pvs = [];
        var ids = [];
        async.parallel({
            parsingName: function (doneParsingAllNames) {
                driver4.findElements(webdriver.By.xpath("//*[@class='Section1000000F00']/table/tbody/tr[td]")).then(function (trs) {
                    async.parallel({
                        parsingId: function (doneParsingId) {
                            var id = {};
                            driver4.findElement(webdriver.By.xpath("//*[@id='ln']")).getText().then(function (idText) {
                                id['source'] = 'LOINC';
                                id['id'] = idText.trim();
                                ids.push(id);
                                doneParsingId();
                            });
                        },
                        parsingFullySpecifiedName: function (doneParsingFullySpecifiedName) {
                            var name = {};
                            driver4.findElements(webdriver.By.xpath("/html/body/div[2]/table/tbody/tr[2]/td[3]/table/tbody/tr[2]/td[1]")).then(function (isFullySpecifiedName) {
                                if (isFullySpecifiedName.length > 0) {
                                    isFullySpecifiedName[0].getText().then(function (fullySpecifiedNameText) {
                                        var context = {};
                                        context['contextName'] = 'Primary Name';
                                        name['designation'] = fullySpecifiedNameText.trim();
                                        name['definition'] = '';
                                        name['context'] = context;
                                        naming.push(name);
                                        doneParsingFullySpecifiedName();
                                    });
                                } else {
                                    doneParsingFullySpecifiedName();
                                }
                            });
                        },
                        parsingLongCommonName: function (doneParsingLongCommonName) {
                            var name = {};
                            driver4.findElements(webdriver.By.xpath('/html/body/div[2]/table/tbody/tr[3]/td[3]')).then(function (isLongCommonName) {
                                if (isLongCommonName.length > 0) {
                                    isLongCommonName[0].getText().then(function (longCommonNameText) {
                                        var context = {};
                                        context['contextName'] = 'Long Common Name';
                                        name['designation'] = longCommonNameText.trim();
                                        name['definition'] = '';
                                        name['context'] = context;
                                        naming.push(name);
                                        doneParsingLongCommonName();
                                    });
                                } else {
                                    doneParsingLongCommonName();
                                }
                            });
                        },
                        parsingShortName: function (doneParsingShortName) {
                            var name = {};
                            driver4.findElements(webdriver.By.xpath('/html/body/div[2]/table/tbody/tr[4]/td[3]')).then(function (isShortName) {
                                if (isShortName.length > 0) {
                                    isShortName[0].getText().then(function (shortNameText) {
                                        var context = {};
                                        context['contextName'] = 'Shortname';
                                        name['designation'] = shortNameText.trim();
                                        name['definition'] = '';
                                        name['context'] = context;
                                        naming.push(name);
                                        doneParsingShortName();
                                    });
                                } else {
                                    doneParsingShortName();
                                }
                            });
                        },
                        parsingQuestionName: function (doneParsingQuestionName) {
                            var name = {};
                            driver4.findElements(webdriver.By.xpath("//div[@class='Section200000']/table/tbody/tr[2]/td[3]")).then(function (isQuestionName) {
                                if (isQuestionName.length > 0) {
                                    isQuestionName[0].getText().then(function (questionNameText) {
                                        var context = {};
                                        context['contextName'] = 'Question';
                                        name['designation'] = questionNameText.trim();
                                        name['definition'] = '';
                                        name['context'] = context;
                                        naming.push(name);
                                        doneParsingQuestionName();
                                    });
                                }
                                else {
                                    doneParsingQuestionName();
                                }
                            });
                        }
                    }, function doneParsingOneNames() {
                        doneParsingAllNames();
                    });
                });
            },
            parsingPermissibleValue: function (doneParsingAllPermissibleValues) {
                driver4.findElements(webdriver.By.xpath("//*[@class='Section80000']/table/tbody/tr")).then(function (pvTrs) {
                    var i = 0;
                    async.eachSeries(pvTrs, function (pvTr, doneOnePvTr) {
                        var pv = {codeSystemName: "LOINC"};
                        i++;
                        if (i > 2) {
                            pvTr.findElements(webdriver.By.css('td')).then(function (pvTds) {
                                var num_tds = pvTds.length;
                                if (num_tds === 8) {
                                    async.parallel({
                                        one: function (b) {
                                            pvTds[3].getText().then(function (pvText) {
                                                pv['valueMeaningName'] = pvText.trim();
                                                pv['permissibleValue'] = pvText.trim();
                                                b();
                                            });
                                        },
                                        two: function (b) {
                                            pvTds[5].getText().then(function (pvText) {
                                                pv['valueMeaningCode'] = pvText.trim();
                                                b();
                                            });
                                        }
                                    }, function () {
                                        pvs.push(pv);
                                        doneOnePvTr();
                                    });
                                }
                                else if (num_tds === 9) {
                                    async.parallel({
                                        one: function (b) {
                                            pvTds[3].getText().then(function (pvText) {
                                                pv['valueMeaningName'] = pvText.trim();
                                                b();
                                            });
                                        },
                                        two: function (b) {
                                            pvTds[5].getText().then(function (pvText) {
                                                pv['permissibleValue'] = pvText.trim();
                                                pv['valueMeaningCode'] = pvText.trim();
                                                b();
                                            });
                                        },
                                        three: function (b) {
                                            pvTds[7].getText().then(function (pvText) {
                                                pv['valueMeaningCode'] = pvText.trim();
                                                b();
                                            });
                                        }
                                    }, function () {
                                        pvs.push(pv);
                                        doneOnePvTr();
                                    });
                                } else if (num_tds === 7) {
                                    async.parallel({
                                        one: function (b) {
                                            pvTds[3].getText().then(function (pvText) {
                                                pv['valueMeaningName'] = pvText.trim();
                                                pv['permissibleValue'] = pvText.trim();
                                                b();
                                            });
                                        },
                                        three: function (b) {
                                            pvTds[6].getText().then(function (pvText) {
                                                pv['valueMeaningCode'] = pvText.trim();
                                                b();
                                            });
                                        }
                                    }, function () {
                                        pvs.push(pv);
                                        doneOnePvTr();
                                    });
                                }
                                else
                                    doneOnePvTr();
                            });
                        }
                        else {
                            doneOnePvTr();
                        }
                    }, function doneAllPvTrs() {
                        doneParsingAllPermissibleValues();
                    });
                });
            }
        }, function doneAllParsingCdeDetail() {
            var valueDomain = {'datatype': pvs.length > 0 ? 'Value List' : 'Text'};
            valueDomain['permissibleValues'] = pvs;
            ele['stewardOrg'] = {"name": 'PhenX'};
            ele['registrationState'] = {"registrationStatus": "Qualified"};
            ele['naming'] = naming;
            ele['valueDomain'] = valueDomain;
            ele['ids'] = ids;
            doneOneEle();
        });
    });
};

var parsingPanel = function (driver, element, numElements, doneOneElement) {
    driver.get(element['href']);
    var driver1 = new webdriver.Builder().forBrowser('firefox').build();
    var driver2 = new webdriver.Builder().forBrowser('firefox').build();
    var elements = [];
    driver.findElements(webdriver.By.xpath("/html/body/div[2]/table[2]/tbody/tr[td]/td[2]/span/a")).then(function (links) {
        if (links.length > 0) {
            element['numElement'] = numElements + links.length - 1;
            var i = 0;
            async.eachSeries(links, function (link, doneOneLink) {
                i++;
                if (i === 1) {
                    doneOneLink();
                } else {
                    var anotherElement = {};
                    anotherElement['classification'] = element['classification'];
                    async.parallel({
                        parsingHref: function (doneParsingHref) {
                            link.getAttribute('href').then(function (hrefText) {
                                anotherElement['href'] = hrefText.trim();
                                driver1.get(anotherElement['href']);
                                driver1.findElements(webdriver.By.xpath("/html/body/div[2]/table[1]/tbody/tr[1]/th/a")).then(function (isPanel) {
                                    if (isPanel.length > 0) {
                                        anotherElement['type'] = 'Panel';
                                        elements.push(anotherElement);
                                        parsingPanel(driver2, anotherElement, element['numElement'], doneParsingHref);
                                    }
                                    else {
                                        elements.push(anotherElement);
                                        anotherElement['type'] = 'Question';
                                        parsingQuestion(driver2, anotherElement, doneParsingHref);
                                    }
                                });
                            });
                        },
                        parsingLoincId: function (doneParsingLoincId) {
                            link.getText().then(function (loincIdText) {
                                anotherElement.loincId = loincIdText.trim();
                                doneParsingLoincId();
                            });
                        }
                    }, function doneAllParsing() {
                        element['elements'] = elements;
                        doneOneLink();
                    });
                }
            }, function doneAllLinks() {
                driver1.quit();
                driver2.quit();
                doneOneElement();
            });
        } else {
            element['numElement'] = numElements;
            doneOneElement();
        }
    });
};

var f = function (elements, doneOneProtocol) {
    var driver4 = new webdriver.Builder().forBrowser('chrome').build();
    async.eachSeries(elements, function (element, doneOneElement) {
        if (element['type'] === 'Question') {
            parsingQuestion(driver4, element, doneOneElement);
        } else {
            parsingPanel(driver4, element, 0, doneOneElement);
        }
    }, function doneAllElements() {
        driver4.quit();
        doneOneProtocol();
    });
};

var isElementPanelOrQuestion = function (doneStep2) {
    Measure.find({step1: 'done', step2: null}, function (err, measures) {
        if (err) throw err;
        async.eachSeries(measures, function (measure, doneOneMeasure) {
            console.log('measure:' + measure.get('href'));
            async.eachSeries(measure.get('protocols'), function (protocol, doneOneProtocol) {
                console.log('protocol:' + protocol['href']);
                var form = protocol.form;
                if (form && form.elements) {
                    f(form.elements, doneOneProtocol);
                }
                else {
                    doneOneProtocol();
                }
            }, function doneAllProtocols() {
                measure.set('step2', 'done');
                measure.markModified('protocols');
                measure.save(function () {
                    doneOneMeasure();
                });
            });
        }, function doneAllMeasures() {
            doneStep2();
        });
    });
};

var loadCdeLoop = function (elements, cdes, cdeCounter, cdeUpdateCounter, cdeSaveCounter, cb) {
    if (elements) {
        async.eachSeries(elements, function (element, doneOneElement) {
            if (element.type === 'Question' && element.remove !== true) {
                cdeCounter++;
                DataElement.findOne({'ids.id': element.loincId}, function (err, result) {
                    if (err) throw err;
                    if (result) {
                        classificationShared.transferClassifications(element, result.toObject());
                        result.markModified('classification');
                        result.save(function () {
                            cdeUpdateCounter++;
                            console.log('finish update cde ' + cdeUpdateCounter);
                            doneOneElement();
                        });
                    } else {
                        element.version = "1.0";
                        mongo_cde.create(element, user, function () {
                            cdes.push(element);
                            cdeSaveCounter++;
                            console.log('finish saving cde ' + cdeSaveCounter);
                            doneOneElement();
                        });
                    }
                });
            }
            else {
                loadCdeLoop(element['elements'], cdes, cdeCounter, cdeUpdateCounter, cdeSaveCounter, doneOneElement);
            }
        }, function doneAllElements() {
            if (cb) cb();
        });
    } else {
        if (cb) cb();
    }
};

var loadCde = function (doneLoadCde) {
    var cdeCounter = 0;
    var cdeUpdateCounter = 0;
    var cdeSaveCounter = 0;
    var cdes = [];
    Measure.find({}, function (err, measures) {
        if (err) throw err;
        async.eachSeries(measures, function (measure, doneOneMeasure) {
            console.log('measure:' + measure.get('href'));
            async.eachSeries(measure.get('protocols'), function (protocol, doneOneProtocol) {
                var form = protocol['form'];
                if (form && form['elements']) {
                    var elements = form['elements'];
                    loadCdeLoop(elements, cdes, cdeCounter, cdeUpdateCounter, cdeSaveCounter, doneOneProtocol);
                }
                else {
                    doneOneProtocol();
                }
            }, function doneAllProtocols() {
                doneOneMeasure();
            });
        }, function doneAllMeasures() {
            var obj = {};
            obj['formInfo'] = true;
            obj['cdes'] = cdes;
            obj.cdeCounter = cdeCounter;
            obj['cdeUpdateCounter'] = cdeUpdateCounter;
            obj['cdeSaveCounter'] = cdeSaveCounter;
            var cache = new Cache(obj);
            cache.save(function () {
                console.log("finished load cde.");
                doneLoadCde();
            });
        });
    });
};

var removePanelElementsLoop = function (elements, cb) {
    var num = 0;
    var j = 0;
    elements.forEach(function (element) {
        j++;
        if (element['numElement']) {
            num = element['numElement'];
            for (var i = 0; i < num; i++) {
                element.elements[i].name = elements[i + j].name;
            }
            removePanelElementsLoop(element['elements'], null);
        }
        else {
            if (num !== 0) {
                element['remove'] = true;
                num--;
            }
        }
    });
    if (cb)
        cb();
};

var removePanelElements = function (doneRemovePanelElements) {
    Measure.find({}, function (err, measures) {
        if (err) throw err;
        async.eachSeries(measures, function (measure, doneOneMeasure) {
            console.log('measure:' + measure.get('href'));
            async.eachSeries(measure.get('protocols'), function (protocol, doneOneProtocol) {
                var form = protocol.form;
                if (form && form.elements) {
                    removePanelElementsLoop(form.elements, doneOneProtocol);
                }
                else {
                    doneOneProtocol();
                }
            }, function doneAllProtocols() {
                measure.markModified('protocols');
                measure.save(doneOneMeasure);
            });
        }, function doneAllMeasures() {
            doneRemovePanelElements();
        });
    });
};

var findFormQuestionLoop = function (form, elements, cb, saveForm) {
    async.eachSeries(elements, function (element, doneOneElement) {
        if (element.remove === true) {
            doneOneElement();
        } else {
            if (element.type === 'Question') {
                mongo_cde.byOtherId("LOINC", element['loincId'], function (err, data) {
                    if (err) {
                        throw err;
                    } else {
                        var pvs = data.valueDomain.permissibleValues;
                        var answers = [];
                        for (var m = 0; m < pvs.length; m++) {
                            if (pvs[m] !== "") {
                                var answer = {
                                    permissibleValue: pvs[m].permissibleValue,
                                    valueMeaningName: pvs[m].valueMeaningName
                                };
                                answers.push(answer);
                            }
                        }
                        var formElement = {
                            elementType: 'question',
                            label: element.name,
                            formElements: [],
                            question: {
                                cde: {
                                    tinyId: "",
                                    version: "",
                                    label: '',
                                    permissibleValues: []
                                },
                                datatype: "",
                                uoms: [],
                                required: {
                                    type: false
                                },
                                editable: {
                                    type: true
                                },
                                multiselect: false,
                                answers: answers
                            }
                        };
                        formElement.question.cde.tinyId = data.tinyId;
                        formElement.question.cde.version = data.version;
                        formElement.question.cde.permissibleValues = data.valueDomain.permissibleValues;
                        formElement.question.datatype = data.valueDomain.datatype;
                        form.formElements.push(formElement);
                    }
                    doneOneElement();
                });
            }
            else {
                var formElement = {
                    elementType: 'section',
                    label: element.name,
                    formElements: [],
                    section: {}
                };
                form.formElements.push(formElement);
                findFormQuestionLoop(formElement, element.elements, doneOneElement, false);
            }
        }
    }, function doneAllElements() {
        if (saveForm) {
            mongo_form.create(form, user, cb);
        } else {
            cb();
        }
    });
};

var loadForm = function (doneLoadForm) {
    var measureCounter = 0;
    var protocolCounter = 0;
    Measure.find({}, function (err, measures) {
        if (err) throw err;
        async.eachSeries(measures, function (measure, doneOneMeasure) {
                var protocols = measure.get('protocols');
                async.eachSeries(protocols, function (protocol, doneOneProtocol) {
                        if (protocol.Protocol) {
                            protocol.Protocol = protocol.Protocol.replace(new RegExp('<img src="', 'g'),
                                '<img src="https://www.phenxtoolkit.org/');
                        }
                        protocolCounter++;
                        console.log('protocolCounter: ' + protocolCounter);
                        var form = {
                            version: '1.0',
                            displayProfiles: [{
                                name: 'default',
                                sectionsAsMatrix: true,
                                displayValues: true,
                                context: 'default'
                            }], formElements: []
                        };
                        form.ids = [
                            {
                                source: 'PhenX',
                                id: protocol.protocolId
                            }
                        ];
                        form['classification'] = protocol['classification'];
                        form.stewardOrg = {name: "PhenX"};
                        var properties = [];
                        protocol.forEach(function (p) {
                            if (p === 'Protocol Name' || p === 'Description of Protocol') {
                                form.naming = [{
                                    designation: protocol['Protocol Name'],
                                    definition: protocol['Description of Protocol'],
                                    context: {
                                        contextName: 'Health'
                                    }
                                }];
                            }
                            else if (p === 'Protocol Release Date') {
                                form.registrationState = {
                                    registrationStatus: "Qualified",
                                    effectiveDate: protocol['Protocol Release Date']
                                };
                            }
                            else if (p === 'protocolHref') {
                                form.referenceDocuments = [{uri: protocol['protocolHref']}];
                            }
                            else if (p === 'Standards') {
                                protocol.Standards.forEach(function (standard) {
                                    if (standard.Source.text === 'LOINC') {
                                        var loincId = {
                                            source: 'LOINC',
                                            id: standard.ID
                                        };
                                        form.ids.push(loincId);
                                    }
                                });
                            }
                            else if (p === 'form' || p === 'classification' || p === 'href' || p === 'protocolId') {
                            }
                            else {
                                var property = {
                                    key: p,
                                    value: protocol[p],
                                    valueFormat: "html"
                                };
                                properties.push(property);
                            }
                        });
                        form['properties'] = properties;
                        var isFormExist = protocol['form'];
                        if (isFormExist) {
                            var elements = isFormExist['elements'];
                            if (elements) {
                                findFormQuestionLoop(form, elements, doneOneProtocol, true);
                            }
                            else {
                                mongo_form.create(form, user, function () {
                                    doneOneProtocol();
                                });
                            }
                        }
                        else {
                            mongo_form.create(form, user, function () {
                                doneOneProtocol();
                            });
                        }
                    },
                    function doneAllProtocols() {
                        measureCounter++;
                        console.log('measureCounter: ' + measureCounter);
                        doneOneMeasure();
                    }
                )
                ;
            }, function
                doneAllMeasures() {
                doneLoadForm();
            }
        );
    });
};


async.series([
    function establishConnection(doneConnectionTest) {
        conn.on('error', function (err) {
            throw err;
        });
        conn.once('open', function callback() {
            console.log("connected to " + mongoUrl);
            async.parallel({
                    getNCIOrg: function (cb) {
                        OrgModel.find({name: "NCI"}).exec(function (findNciOrgError, thisNciOrgs) {
                            if (findNciOrgError) throw findNciOrgError;
                            else if (thisNciOrgs.length === 0) {
                                new OrgModel({name: 'NCI'}).save(function (createNciOrgError, thisNciOrg) {
                                    if (createNciOrgError)throw createNciOrgError;
                                    else {
                                        nciOrg = thisNciOrg;
                                        cb();
                                    }
                                })
                            } else {
                                nciOrg = thisNciOrgs[0];
                                cb();
                            }
                        });
                    },
                    getPhenXOrg: function (cb) {
                        OrgModel.find({name: "PhenX"}).exec(function (findPhenxOrgError, thisNciOrgs) {
                            if (findPhenxOrgError) throw findPhenxOrgError;
                            else if (thisNciOrgs.length === 0) {
                                new OrgModel({name: 'PhenX'}).save(function (createPhenxOrgError, thisPhenxOrg) {
                                    if (createPhenxOrgError)throw createPhenxOrgError;
                                    else {
                                        phenxOrg = thisPhenxOrg;
                                        cb();
                                    }
                                })
                            } else {
                                phenxOrg = thisNciOrgs[0];
                                cb();
                            }
                        });
                    }
                },
                function doneEstablishOrg() {
                    doneConnectionTest();
                });
        });
    },
    remoteGrabFromPhenX,
    isElementPanelOrQuestion,
    removePanelElements,
    loadCde,
    loadForm,
    function () {
        process.exit(1);
    }
]);


