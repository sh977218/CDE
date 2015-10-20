var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until,
    fs = require('fs'),
    mongoose = require('mongoose'),
    config = require('../../modules/system/node-js/parseConfig'),
    cde_schemas = require('../../modules/cde/node-js/schemas'),
    classificationShared = require('../../modules/system/shared/classificationShared'),
    mongo_data_system = require('../../modules/system/node-js/mongo-data'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    async = require('async');

// global variables
var baseUrl = "https://www.phenxtoolkit.org/index.php?pageLink=browse.measures&tree=off";
var mongoUrlMigration = config.mongoMigrationUri;
var mongoUrl = config.mongoUri;
var conn = mongoose.createConnection(mongoUrl, {auth: {authdb: "admin"}});
var connMigration = mongoose.createConnection(mongoUrlMigration, {auth: {authdb: "admin"}});
var cacheSchema = mongoose.Schema({}, {strict: false});
var cdeSchema = mongoose.Schema({}, {strict: false});
var formSchema = mongoose.Schema({}, {strict: false});
var measureSchema = mongoose.Schema({}, {strict: false});
var Measure = conn.model('measure', measureSchema);
var DataElement = conn.model('DataElement', cde_schemas.dataElementSchema);
var Cache = conn.model('cache', cacheSchema);
var Cde = conn.model('cde', cdeSchema);
var Form = conn.model('form', formSchema);
var user = {username: "batchloader"};
var skipShortNameMap = {};
var phenxOrg = null;

var parsingQuestion = function (driver4, ele, doneOneEle) {
    driver4.get(ele['href']);
    driver4.findElements(webdriver.By.xpath("/html/body/div[2]/table[1]/tbody/tr[1]/th")).then(function (temp) {
        var namingCounter = 0;
        var pvsCounter = 0;
        var idsCounter = 0;
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
                                idsCounter++;
                                console.log('idsCounter: ' + idsCounter);
                                doneParsingId();
                            })
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
                                        namingCounter++;
                                        console.log('namingCounter: ' + namingCounter);
                                        naming.push(name);
                                        doneParsingFullySpecifiedName();
                                    })
                                } else {
                                    doneParsingFullySpecifiedName();
                                }
                            })
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
                                        namingCounter++;
                                        console.log('namingCounter: ' + namingCounter);
                                        naming.push(name);
                                        doneParsingLongCommonName();
                                    })
                                } else {
                                    doneParsingLongCommonName();
                                }
                            })
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
                                        namingCounter++;
                                        console.log('namingCounter: ' + namingCounter);
                                        naming.push(name);
                                        doneParsingShortName();
                                    })
                                } else {
                                    doneParsingShortName();
                                }
                            })
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
                                        namingCounter++;
                                        console.log('namingCounter: ' + namingCounter);
                                        naming.push(name);
                                        doneParsingQuestionName();
                                    })
                                }
                                else {
                                    doneParsingQuestionName();
                                }
                            })
                        }
                    }, function doneParsingOneNames() {
                        doneParsingAllNames();
                    })
                })
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
                                if (num_tds == 8) {
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
                                        pvsCounter++;
                                        console.log('pvsCounter: ' + pvsCounter);
                                        pvs.push(pv);
                                        doneOnePvTr();
                                    });
                                }
                                else if (num_tds == 9) {
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
                                        pvsCounter++;
                                        console.log('pvsCounter: ' + pvsCounter);
                                        pvs.push(pv);
                                        doneOnePvTr();
                                    });
                                } else if (num_tds == 7) {
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
                                        pvsCounter++;
                                        console.log('pvsCounter: ' + pvsCounter);
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
                    })
                })
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

var step1 = function (doneStep1) {
    var log = {};
    var protocolCounter = 0;
    var measureCounter = 0;
    var cdeCounter = 0;
    var allMeasures = [];
    var skipShortNameMap = {};
    var measureXpath = "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td/div/div/a[2]";
    var driver = new webdriver.Builder().forBrowser('firefox').build();
    var driver1 = new webdriver.Builder().forBrowser('firefox').build();
    var driver2 = new webdriver.Builder().forBrowser('firefox').build();
    var driver3 = new webdriver.Builder().forBrowser('firefox').build();
    var driver4 = new webdriver.Builder().forBrowser('firefox').build();
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
                            driver1.get(measure['href']);
                            async.series([
                                    function parsingMeasureIntroduction(doneParsingMeasureIntroduction) {
                                        driver1.findElement(webdriver.By.xpath('/html/body/center/table/tbody/tr[3]/td/div/div[5]/div[1]')).getText().then(function (text) {
                                            measure['introduction'] = text.trim();
                                            doneParsingMeasureIntroduction();
                                        })
                                    },
                                    function parsingMeasureClassifiction(doneParsingMeasureClassification) {
                                        driver1.findElements(webdriver.By.xpath("//p[@class='back'][1]/a")).then(function (classificationArr) {
                                            if (classificationArr.length > 0) {
                                                var classification = [];
                                                async.eachSeries(classificationArr, function (c, doneOneC) {
                                                    c.getText().then(function (text) {
                                                        classification.push(text.trim());
                                                        doneOneC();
                                                    })
                                                }, function doneAllC() {
                                                    var classi = [{
                                                        stewardOrg: {name: "PhenX"},
                                                        elements: []
                                                    }];
                                                    var temp = classi[0].elements;
                                                    for (var i = 0; i < classification.length; i++) {
                                                        var ele = {};
                                                        ele['name'] = classification[i];
                                                        ele['elements'] = [];
                                                        temp.push(ele);
                                                        temp = temp[0].elements;
                                                    }
                                                    measure['classification'] = classi;
                                                    classificationShared.addCategory({elements: phenxOrg.classifications}, classification);
                                                    phenxOrg.save(function (err) {
                                                        if (err) throw err;
                                                        doneParsingMeasureClassification();
                                                    });
                                                })
                                            } else {
                                                doneParsingMeasureClassification();
                                            }
                                        })
                                    },
                                    function parsingMeasureProtocol(doneParsingMeasureProtocol) {
                                        var protocols = [];
                                        driver1.findElements(webdriver.By.xpath("//*[@id='browse_measure_protocol_list']/table/tbody/tr/td/div/div[@class='search']/a[2]")).then(function (protocolLinks) {
                                            async.eachSeries(protocolLinks, function (protocolLink, doneOneProtocolLink) {
                                                protocolLink.getAttribute('href').then(function (text) {
                                                    var protocol = {};
                                                    protocol['classification'] = measure['classification'];
                                                    protocol['href'] = text.trim();
                                                    driver2.get(protocol['href']);
                                                    driver2.findElement(webdriver.By.id('button_showfull')).click().then(function () {
                                                        driver2.findElements(webdriver.By.xpath("//*[contains(@id,'label')]")).then(function (labels) {
                                                            async.eachSeries(labels, function (label, doneOneLabel) {
                                                                label.getAttribute('id').then(function (id) {
                                                                    label.getText().then(function (key) {
                                                                        var newId = id.replace('label', 'element');
                                                                        if (newId.indexOf('STANDARDS') > -1) {
                                                                            var standards = [];
                                                                            driver2.findElements(webdriver.By.xpath("//*[@id='" + newId + "']//table/tbody/tr[td]")).then(function (trs) {
                                                                                var standard = {};
                                                                                async.eachSeries(trs, function (tr, doneOneStandardsTr) {
                                                                                    tr.findElements(webdriver.By.css('td')).then(function (tds) {
                                                                                        async.parallel({
                                                                                            parsingStandard: function (doneParsingStandard) {
                                                                                                tds[0].getText().then(function (text) {
                                                                                                    standard['Standard'] = text;
                                                                                                    doneParsingStandard();
                                                                                                })
                                                                                            },
                                                                                            parsingName: function (doneParsingName) {
                                                                                                tds[1].getText().then(function (text) {
                                                                                                    standard['Name'] = text;
                                                                                                    doneParsingName();
                                                                                                })
                                                                                            },
                                                                                            parsingId: function (doneParsingId) {
                                                                                                tds[2].getText().then(function (text) {
                                                                                                    standard['ID'] = text;
                                                                                                    doneParsingId();
                                                                                                })
                                                                                            },
                                                                                            parsingSource: function (doneParsingSource) {
                                                                                                var source = {};
                                                                                                tds[3].getText().then(function (text) {
                                                                                                    source['text'] = text.trim();
                                                                                                    tds[3].findElement(webdriver.By.css('a')).then(function (a) {
                                                                                                        a.getAttribute('href').then(function (href) {
                                                                                                            source['href'] = href.trim();
                                                                                                            if (text.trim() === 'LOINC') {
                                                                                                                var form = {};
                                                                                                                form['classification'] = protocol['classification'];
                                                                                                                driver3.get(source['href']);
                                                                                                                driver3.findElements(webdriver.By.xpath("/html/body/div[2]/table[2]/tbody/tr[td]/td[2]/span/a")).then(function (temp) {
                                                                                                                    if (temp.length > 0) {
                                                                                                                        var elements = [];
                                                                                                                        var i = 0;
                                                                                                                        async.eachSeries(temp, function (a, doneOneA) {
                                                                                                                            var element = {};
                                                                                                                            i++;
                                                                                                                            async.parallel({
                                                                                                                                parsingLinks: function (doneParsingLink) {
                                                                                                                                    a.getAttribute('href').then(function (elementHrefText) {
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
                                                                                                                                    a.getText().then(function (elementHrefText) {
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
                                                                                                                                if (i != 1)
                                                                                                                                    elements.push(element);
                                                                                                                                doneOneA();
                                                                                                                            });
                                                                                                                        }, function doneAllAs() {
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
                                                                                                            } else {
                                                                                                                standard['Source'] = source;
                                                                                                                doneParsingSource();
                                                                                                            }
                                                                                                        })
                                                                                                    })
                                                                                                })
                                                                                            }
                                                                                        }, function doneAllStandardsTds() {
                                                                                            standards.push(standard);
                                                                                            doneOneStandardsTr();
                                                                                        })
                                                                                    });
                                                                                }, function doneAllStandardsTrs() {
                                                                                    protocol['Standards'] = standards;
                                                                                    doneOneLabel();
                                                                                });
                                                                            })
                                                                        }
                                                                        else if (newId.indexOf('PROTOCOL_TEXT') > -1 || newId.indexOf('Requirements') > -1 || newId.indexOf('SPECIFIC_INSTRUCTIONS') > -1) {
                                                                            driver2.findElements(webdriver.By.xpath("//*[@id='" + newId + "']")).then(function (temp) {
                                                                                if (temp.length > 0) {
                                                                                    temp[0].getOuterHtml().then(function (html) {
                                                                                        doneOneLabel();
                                                                                    });
                                                                                }
                                                                                else
                                                                                    doneOneLabel();
                                                                            })
                                                                        }
                                                                        else {
                                                                            driver2.findElement(webdriver.By.id(newId)).getText().then(function (text) {
                                                                                protocol[key.trim()] = text;
                                                                                doneOneLabel();
                                                                            })
                                                                        }
                                                                    })
                                                                });
                                                            }, function donAllLabels() {
                                                                driver2.findElements(webdriver.By.xpath("//*[@class='back'][1]/a")).then(function (temp) {
                                                                    if (temp.length > 0) {
                                                                        temp[temp.length - 1].getText().then(function (text) {
                                                                            protocol['Protocol Name'] = text.trim();
                                                                            protocolCounter++;
                                                                            protocols.push(protocol);
                                                                            console.log('finished protocol ' + protocolCounter);
                                                                            doneOneProtocolLink();
                                                                        })
                                                                    }
                                                                    else {
                                                                        doneOneProtocolLink();
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    });
                                                })
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
                            )
                        }
                    ],
                    function doneAllMeasureParsing(err, result) {
                        measure['step1'] = 'done';
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
                            })
                        },
                        parsingLoincId: function (doneParsingLoincId) {
                            link.getText().then(function (loincIdText) {
                                anotherElement['loincId'] = loincIdText.trim();
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
    })
};

var f = function (elements, doneOneProtocol) {
    var driver4 = new webdriver.Builder().forBrowser('firefox').build();
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

var step2 = function (doneStep2) {
    var cdeCounter = 0;
    var panelCde = [];
    Measure.find({step1: 'done', step2: null}, function (err, measures) {
        if (err) throw err;
        async.eachSeries(measures, function (measure, doneOneMeasure) {
            console.log('measure:' + measure.get('href'));
            async.eachSeries(measure.get('protocols'), function (protocol, doneOneProtocol) {
                console.log('protocol:' + protocol['href']);
                var form = protocol['form'];
                if (form && form['elements']) {
                    var elements = form['elements'];
                    f(elements, doneOneProtocol);
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
            })
        }, function doneAllMeasures() {
            doneStep2();
        })
    })
};

var loadCdeLoop = function (elements, cdes, cdeCounter, cdeUpdateCounter, cdeSaveCounter, cb) {
    async.eachSeries(elements, function (element, doneOneElement) {
        if (element['type'] === 'Question' && element['remove'] != true) {
            cdeCounter++;
            DataElement.findOne({'ids.id': element['loincId']}, function (err, result) {
                if (err) throw err;
                if (result) {
                    classificationShared.transferClassifications(element, result.toObject());
                    result.markModified('classification');
                    result.save(function () {
                        cdeUpdateCounter++;
                        console.log('finish update cde ' + cdeUpdateCounter);
                        doneOneElement();
                    });
                }
                else {
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
            loadCdeLoop(element['elements'], cdes, cdeCounter, cdeUpdateCounter, cdeSaveCounter, null);
        }
    }, function doneAllElements() {
        if (cb)
            cb();
    });
};

var loadCde = function (doneLoadCde) {
    var cdeCounter = 0;
    var cdeUpdateCounter = 0;
    var cdeSaveCounter = 0;
    var cdes = [];
    Measure.find({href: "https://www.phenxtoolkit.org/index.php?pageLink=browse.protocols&id=61200"}, function (err, measures) {
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
            obj['cdeCounter'] = cdeCounter;
            obj['cdeUpdateCounter'] = cdeUpdateCounter;
            obj['cdeSaveCounter'] = cdeSaveCounter;
            var cache = new Cache(obj);
            cache.save(function () {
                console.log("finished load cde.");
                doneLoadCde();
            })
        });
    });
};

var loadForm = function (doneForm) {
    var measureCounter = 0;
    var protocolCounter = 0;
    var formCounter = 0;
    Measure.find({}, function (err, measures) {
        if (err) throw err;
        var driver = new webdriver.Builder().forBrowser('firefox').build();
        async.eachSeries(measures, function (measure, doneOneMeasure) {
            var protocols = measure.get('protocols');
            var form = {
                classification: measure['classification']
            };
            async.eachSeries(protocols, function (protocol, doneOneProtocol) {
                    var stewardOrg = {name: "PhenX"};
                    form['stewardOrg'] = stewardOrg;
                    var properties = [];
                    for (var p in protocol) {
                        if (protocol.hasOwnProperty(p)) {
                            if (p === 'Protocol Name' || p === 'Description of Protocol') {
                                var naming = [];
                                var name = {};
                                name['designation'] = protocol['Protocol Name'];
                                name['definition'] = protocol['Description of Protocol'];
                                naming.push(name);
                                form['naming'] = naming;
                            }
                            else if (p === 'Protocol Release Date') {
                                var registrationState = {
                                    registrationStatus: "Qualified",
                                    effectiveDate: protocol['Protocol Release Date']
                                };
                                form['registrationState'] = registrationState;
                            }
                            else if (p === 'protocolHref') {
                                var referenceDocuments = [];
                                var referenceDocument = {uri: protocol['protocolHref']};
                                referenceDocuments.push(referenceDocument);
                                form['referenceDocuments'] = referenceDocuments;
                            }
                            else if (p === 'Standards') {
                            }
                            else {
                                var property = {
                                    key: p,
                                    value: protocol[p],
                                    valueFormat: "html"
                                };
                                properties.push(property);
                            }
                        }
                    }
                    form['properties'] = properties;
                    protocolCounter++;
                    var newForm = new Form(form);
                    newForm.save(function () {
                        formCounter++;
                        doneOneProtocol();
                    })
                }
                ,
                function doneAllProtocols() {
                    measureCounter++;
                    doneOneMeasure();
                }
            )
            ;
        }, function doneAllMeasures() {
            var obj = {};
            obj['formInfo'] = true;
            obj['measureCounter'] = measureCounter;
            obj['protocolCounter'] = protocolCounter;
            obj['formCounter'] = formCounter;
            var cache = new Cache(obj);
            cache.save(function () {
                driver.quit();
                console.log("finished all protocols to forms.");
                doneForm();
            })
        });
    });
};

var removePanelElementsLoop = function (elements, cb) {
    var num = 0;
    elements.forEach(function (element) {
        if (element['numElement']) {
            num = element['numElement'];
            removePanelElementsLoop(element['elements'], null);
        }
        else {
            if (num != 0) {
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
                var form = protocol['form'];
                if (form && form['elements']) {
                    removePanelElementsLoop(form['elements'], doneOneProtocol);
                }
                else {
                    doneOneProtocol();
                }
            }, function doneAllProtocols() {
                measure.markModified('protocols');
                measure.save(function () {
                    doneOneMeasure();
                });
            });
        }, function doneAllMeasures() {
            doneRemovePanelElements();
        });
    });
};

async.series([
    function (doneConnectionTest) {
        conn.on('error', function (err) {
            throw err;
        });
        conn.once('open', function callback() {
            console.log("connected to " + mongoUrl);
            mongo_data_system.orgByName("PhenX", function (stewardOrg) {
                phenxOrg = stewardOrg;
                if (!phenxOrg) {
                    throw "PhenX Org does not exists!";
                }
                doneConnectionTest();
            });
        });
    },
    function (doneStep1) {
        step1(doneStep1);
    },
    function (doneStep2) {
        step2(doneStep2);
    },

    function (doneRemovePanelElements) {
        removePanelElements(doneRemovePanelElements);
    },

    function (doneLoadCde) {
        loadCde(doneLoadCde);
    },


    function (doneCleanUp) {
        process.exit(1);
    }
]);




