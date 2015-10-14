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
var cdeBrowsers = [];
var loinc = [];
var forms = [];
var allMeasureLinks = [];
var skipShortNameMap = {};
var phenxOrg = null;

var step1 = function (doneStep1) {
    var allProtocolCounter = 0;
    var allMeasureCounter = 0;
    var xpathCounter = 0;
    var xpaths = ["//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td[1]/div/div", "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td[2]/div/div"];
    var driver = new webdriver.Builder().forBrowser('firefox').build();
    driver.get(baseUrl);
    async.eachSeries(xpaths, function (xpath, doneOneXpath) {
            driver.findElements(webdriver.By.xpath(xpath)).then(function (links) {
                async.eachSeries(links, function (link, doneOneLink) {
                    link.findElements(webdriver.By.css('a')).then(function (hrefs) {
                        hrefs[1].getAttribute('href').then(function (text) {
                            allMeasureLinks.push(text);
                            doneOneLink();
                        });
                    })
                }, function doneAllLinks() {
                    xpathCounter++;
                    console.log('finished xpath ' + xpathCounter);
                    doneOneXpath();
                });
            });
        }, function doneAllXpaths() {
            console.log("there are " + allMeasureLinks.length + " sites need to go.");
            async.eachSeries(allMeasureLinks, function (measureLink, doneOneMeasureLink) {
                    var obj = {};
                    obj['measureHref'] = measureLink;
                    var protocols = [];
                    driver.get(measureLink);
                    async.parallel({
                        parsingClassification: function (doneParsingClassification) {
                            driver.findElement(webdriver.By.xpath("//*[@class='back'][1]")).getText().then(function (classifcationText) {
                                var arr = classifcationText.split(/[^A-z \:]/).map(function (a) {
                                    return a.trim()
                                });
                                var classification = arr.slice(1, arr.length);
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
                                obj['classification'] = classi;
                                classificationShared.addCategory({elements: phenxOrg.classifications}, classification);
                                phenxOrg.save(function (err) {
                                    if (err) throw err;
                                    doneParsingClassification();
                                });
                            });
                        },
                        parsingProtocolsLink: function (doneParsingProtocolsLink) {
                            driver.findElements(webdriver.By.xpath("//*[@id='browse_measure_protocol_list']/table/tbody/tr/td/div/div[@class='search']/a[2]")).then(function (protocolLinks) {
                                async.eachSeries(protocolLinks, function (protocolLink, doneOneProtocolLink) {
                                    protocolLink.getAttribute('href').then(function (text) {
                                        var protocol = {};
                                        protocol['protocolHref'] = text;
                                        protocols.push(protocol);
                                        allProtocolCounter++;
                                        console.log("finished protocol " + allProtocolCounter);
                                        doneOneProtocolLink();
                                    })
                                }, function doneAllProtocolLinks() {
                                    doneParsingProtocolsLink();
                                });
                            });
                        },
                        parsingMeasureIntroduction: function (doneParsingMeasureIntroduction) {
                            driver.findElement(webdriver.By.xpath('/html/body/center/table/tbody/tr[3]/td/div/div[5]/div[1]')).getText().then(function (text) {
                                obj['introduction'] = text;
                                doneParsingMeasureIntroduction();
                            })
                        }
                    }, function doneAllParsing() {
                        obj['protocols'] = protocols;
                        var measure = new Measure(obj);
                        measure.save(function () {
                            allMeasureCounter++;
                            console.log("finished measure " + allMeasureCounter);
                            doneOneMeasureLink();
                        });
                    });
                },
                function doneAllMeasureLinks() {
                    driver.quit();
                    console.log('finished all measures.');
                    console.log("**********done step1");
                    doneStep1();
                }
            )
        }
    );
};

var step2 = function (doneStep2) {
    var measureCounter = 0;
    var protocolCounter = 0;
    Measure.find({}, function (err, measures) {
        if (err) throw err;
        var driver = new webdriver.Builder().forBrowser('firefox').build();
        async.eachSeries(measures, function (measure, doneOneMeasure) {
            var measureHref = measure.get('measureHref');
            var protocols = measure.get('protocols');
            async.eachSeries(protocols, function (protocol, doneOneProtocol) {
                var protocolHref = protocol['protocolHref'];
                driver.get(protocolHref);
                driver.findElement(webdriver.By.id('button_showfull')).click().then(function () {
                    driver.findElements(webdriver.By.xpath("//*[contains(@id,'label')]")).then(function (labels) {
                        async.eachSeries(labels, function (label, doneOneLabel) {
                            label.getAttribute('id').then(function (id) {
                                label.getText().then(function (key) {
                                    var newId = id.replace('label', 'element');
                                    if (newId.indexOf('STANDARDS') > -1) {
                                        var standards = [];
                                        driver.findElements(webdriver.By.xpath("//*[@id='" + newId + "']//table/tbody/tr[td]")).then(function (trs) {
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
                                                                source['text'] = text;
                                                                tds[3].findElement(webdriver.By.css('a')).then(function (a) {
                                                                    a.getAttribute('href').then(function (href) {
                                                                        source['href'] = href;
                                                                        if (source['text'] === 'CDE Browser') {
                                                                            cdeBrowsers[href] = href;
                                                                        }
                                                                        if (source['text'] === 'LOINC') {
                                                                            loinc.push({
                                                                                classification: measure.get('classification'),
                                                                                loincHref: href
                                                                            });
                                                                        }
                                                                        standard['Source'] = source;
                                                                        doneParsingSource();
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
                                    else if (newId.indexOf('REQUIREMENTS') > -1) {
                                        var requirements = [];
                                        driver.findElements(webdriver.By.xpath("//*[@id='" + newId + "']//table/tbody/tr[td]")).then(function (trs) {
                                            var requirement = {};
                                            async.eachSeries(trs, function (tr, doneOneRequirementsTr) {
                                                tr.findElements(webdriver.By.css('td')).then(function (tds) {
                                                    async.parallel({
                                                            parsingRequirementCategory: function (doneParsingRequirementCategory) {
                                                                tds[0].getText().then(function (text) {
                                                                    requirement['Requirement Category'] = text;
                                                                    doneParsingRequirementCategory();
                                                                })
                                                            },
                                                            parsingRequired: function (doneParsingRequired) {
                                                                tds[1].getText().then(function (text) {
                                                                    requirement['Required'] = text;
                                                                    doneParsingRequired();
                                                                })
                                                            }
                                                        }
                                                        , function doneAllRequirementsTds() {
                                                            requirements.push(requirement);
                                                            doneOneRequirementsTr();
                                                        })
                                                });
                                            }, function doneAllRequirementsTrs() {
                                                protocol['requirements'] = requirements;
                                                doneOneLabel();
                                            });
                                        })
                                    }
                                    else {
                                        driver.findElement(webdriver.By.id(newId)).getText().then(function (text) {
                                            protocol[key.trim()] = text;
                                            doneOneLabel();
                                        })
                                    }
                                })
                            });
                        }, function donAllLabels() {
                            protocolCounter++;
                            console.log('finished protocol ' + protocolCounter);
                            doneOneProtocol();
                        });
                    });
                });
            }, function doneAllProtocols() {
                measure.markModified('protocols');
                measure.save(function (err) {
                    if (err)
                        throw err;
                    measureCounter++;
                    console.log("finished measure " + measureCounter);
                    doneOneMeasure();
                });
            });
        }, function doneAllMeasures() {
            console.log('finished all measures');
            var obj = {};
            obj['cdeBrowser'] = Object.keys(cdeBrowsers);
            obj['loinc'] = loinc;
            obj['log'] = true;
            obj['measureCounter'] = measureCounter;
            obj['protocolCounter'] = protocolCounter;
            var cache = new Cache(obj);
            cache.save(function () {
                driver.quit();
                console.log('saved log into cache collection');
                console.log("*************done step 2");
                doneStep2();
            });
        });
    })
};

var step3 = function (doneStep3) {
    var loincCounter = 0;
    var cdeSaveCounter = 0;
    var cdeUpdateCounter = 0;
    var formCounter = 0;
    var CdeUpdateMap = [];
    Cache.findOne({"log": true}, function (err, cache) {
        if (err) throw err;
        var driver = new webdriver.Builder().forBrowser('firefox').build();
        async.eachSeries(cache.get('loinc'), function (loinc, doneOneLoinc) {
            var loincHref = loinc['loincHref'];
            var classification = loinc['classification'];
            var form = {};
            form['classification'] = classification;
            form['href1'] = loincHref;
            driver.get(loincHref);
            driver.findElements(webdriver.By.xpath("/html/body/div[2]/table[2]/tbody/tr[td]")).then(function (trs) {
                    var numTr = trs.length;
                    var i = 0;
                    async.eachSeries(trs, function (tr, doneOneTr) {
                        i++;
                        if (i < numTr) {
                            tr.getText().then(function (text) {
                                var cdes = [];
                                if (text.indexOf("     ") > -1) {
                                    var cde = {};
                                    cde['classification'] = classification;
                                    tr.findElements(webdriver.By.css('td')).then(function (tds) {
                                        async.parallel({
                                            parsingLoincNum: function (doneParsingLoincNum) {
                                                tds[1].getText().then(function (text) {
                                                    cde['LOINC#'] = text.trim();
                                                    tds[1].findElement(webdriver.By.css('a')).then(function (a) {
                                                        a.getAttribute('href').then(function (href) {
                                                            cde['href'] = href;
                                                            doneParsingLoincNum();
                                                        })
                                                    })
                                                });
                                            },
                                            parsingLoincName: function (doneParsingLoincName) {
                                                tds[2].getText().then(function (tdText) {
                                                    cde['LOINC Name'] = tdText;
                                                    doneParsingLoincName();
                                                })
                                            },
                                            parsingRoc: function (doneParsingRoc) {
                                                tds[3].getText().then(function (tdText) {
                                                    cde['R/O/C'] = tdText;
                                                    doneParsingRoc();
                                                })
                                            },
                                            parsingCardinality: function (doneParsingCardinality) {
                                                tds[4].getText().then(function (tdText) {
                                                    cde['Cardinality'] = tdText;
                                                    doneParsingCardinality();
                                                })
                                            },
                                            parsingUCUM: function (doneParsingUCUM) {
                                                tds[5].getText().then(function (tdText) {
                                                    cde['Ex. UCUM Units'] = tdText;
                                                    doneParsingUCUM();
                                                })
                                            }
                                        }, function doneAllTds() {
                                            cdes.push(cde);
                                            Cde.findOne({"LOINC#": cde["LOINC#"]}, function (err, result) {
                                                if (err) throw err;
                                                if (result) {
                                                    classificationShared.transferClassifications(cde, result.toObject());
                                                    result.markModified('classification');
                                                    result.save(function () {
                                                        CdeUpdateMap.push(cde["LOINC#"]);
                                                        cdeUpdateCounter++;
                                                        console.log('finish update cde ' + cdeUpdateCounter);
                                                        doneOneTr();
                                                    });
                                                }
                                                else {
                                                    var newCde = new Cde(cde);
                                                    newCde.save(function () {
                                                        cdeSaveCounter++;
                                                        console.log('finish saving cde ' + cdeSaveCounter);
                                                        doneOneTr();
                                                    });
                                                }
                                            });
                                        })

                                    })
                                } else {
                                    tr.findElements(webdriver.By.css('td')).then(function (tds) {
                                        async.parallel({
                                            parsingLoincNum: function (doneParsingLoincNum) {
                                                tds[1].getText().then(function (text) {
                                                    form['LOINC#'] = text.trim();
                                                    tds[1].findElement(webdriver.By.css('a')).then(function (a) {
                                                        a.getAttribute('href').then(function (href) {
                                                            form['href2'] = href;
                                                            doneParsingLoincNum();
                                                        })
                                                    })
                                                })

                                            },
                                            parsingLoincName: function (doneParsingLoincName) {
                                                tds[2].getText().then(function (tdText) {
                                                    form['LOINC Name'] = tdText;
                                                    doneParsingLoincName();
                                                })
                                            },
                                            parsingRoc: function (doneParsingRoc) {
                                                tds[3].getText().then(function (tdText) {
                                                    form['R/O/C'] = tdText;
                                                    doneParsingRoc();
                                                })
                                            },
                                            parsingCardinality: function (doneParsingCardinality) {
                                                tds[4].getText().then(function (tdText) {
                                                    form['Cardinality'] = tdText;
                                                    doneParsingCardinality();
                                                })
                                            },
                                            parsingUCUM: function (doneParsingUCUM) {
                                                tds[5].getText().then(function (tdText) {
                                                    form['Ex. UCUM Units'] = tdText;
                                                    doneParsingUCUM();
                                                })
                                            }
                                        }, function doneAllTds() {
                                            var newForm = new Form(form);
                                            newForm.save(function () {
                                                formCounter++;
                                                console.log("formCounter: " + formCounter);
                                                doneOneTr();
                                            });
                                        })
                                    });
                                }
                            })
                        }
                        else {
                            doneOneTr();
                        }
                    }, function doneAllTrs() {
                        loincCounter++;
                        console.log("loincCounter: " + loincCounter);
                        doneOneLoinc();
                    });
                }
            );
        }, function doneAllLoinc() {
            driver.quit();
            var o = {};
            o['CdeUpdateMap'] = CdeUpdateMap;
            o['cdeSaveCounter'] = cdeSaveCounter;
            o['cdeUpdateCounter'] = cdeUpdateCounter;
            var cache = new Cache(o);

            cache.save(function () {
                console.log("finished all loincCounter: " + loincCounter);
                console.log("************done step 3");
                doneStep3();
            });
        });
    });
};

var step4 = function (doneStep4) {
    var cdeCounter = 0;
    Cde.find({}, function (err, cdes) {
        if (err) throw err;
        var driver = new webdriver.Builder().forBrowser('firefox').build();
        async.eachSeries(cdes, function (cde, doneOneCde) {
            var skipShortName = false;
            var skipQuestionName = false;
            var href = cde.get('href');
            driver.get(href);
            var naming = [];
            var pvs = [];
            var ids = [];
            async.parallel({
                parsingName: function (doneParsingAllNames) {
                    driver.findElements(webdriver.By.xpath("//*[@class='Section1000000F00']/table/tbody/tr[td]")).then(function (trs) {
                        if (trs.length == 2) {
                            skipShortName = true;
                            skipShortNameMap[href] = true;
                        }
                        if (href === 'http://r.details.loinc.org/LOINC/24547-2.html?sections=Comprehensive') {
                            skipQuestionName = true;
                            skipShortNameMap[href] = true;
                        }
                        async.parallel({
                            parsingId: function (doneParsingId) {
                                var id = {};
                                driver.findElement(webdriver.By.xpath("//*[@id='ln']")).getText().then(function (text) {
                                    id['source'] = 'loinc';
                                    id['id'] = text;
                                    ids.push(id);
                                    doneParsingId();
                                })
                            },
                            parsingFullySpecifiedName: function (doneParsingFullySpecifiedName) {
                                var name = {};
                                driver.findElement(webdriver.By.xpath("/html/body/div[2]/table/tbody/tr[2]/td[3]/table/tbody/tr[2]/td[1]")).getText().then(function (text) {
                                    var context = {};
                                    context['contextName'] = 'Primary Name';
                                    name['designation'] = text;
                                    name['context'] = context;
                                    naming.push(name);
                                    doneParsingFullySpecifiedName();
                                })
                            },
                            parsingLongCommonName: function (doneParsingLongCommonName) {
                                var name = {};
                                trs[1].findElements(webdriver.By.css('td')).then(function (tds) {
                                    tds[2].getText().then(function (text) {
                                        var context = {};
                                        context['contextName'] = 'Long Common Name';
                                        name['designation'] = text;
                                        name['context'] = context;
                                        naming.push(name);
                                        doneParsingLongCommonName();
                                    })
                                })
                            },
                            parsingShortName: function (doneParsingShortName) {
                                if (skipShortName === true) {
                                    doneParsingShortName()
                                }
                                else {
                                    var name = {};
                                    trs[2].findElements(webdriver.By.css('td')).then(function (tds) {
                                        tds[2].getText().then(function (text) {
                                            var context = {};
                                            context['contextName'] = 'Shortname';
                                            name['designation'] = text;
                                            name['context'] = context;
                                            naming.push(name);
                                            doneParsingShortName();
                                        })
                                    })
                                }
                            },
                            parsingQuestionName: function (doneParsingQuestionName) {
                                if (skipShortName || skipQuestionName) {
                                    doneParsingQuestionName();
                                }
                                else {
                                    var name = {};
                                    driver.findElements(webdriver.By.xpath("//div[@class='Section200000']/table/tbody/tr[2]/td[3]")).then(function (temp) {
                                        if (temp.size > 0) {
                                            temp[0].getText().then(function (text) {
                                                var context = {};
                                                context['contextName'] = 'Question';
                                                name['designation'] = text;
                                                name['context'] = context;
                                                naming.push(name);
                                                doneParsingQuestionName();
                                            })
                                        }
                                        else {
                                            doneParsingQuestionName();
                                        }
                                    })
                                }
                            }
                        }, function doneParsingOneNames() {
                            console.log("finished name");
                            doneParsingAllNames();
                        })
                    })
                },
                parsingPermissibleValue: function (doneParsingAllPermissibleValues) {
                    driver.findElements(webdriver.By.xpath("//*[@class='Section80000']/table/tbody/tr")).then(function (trs) {
                        var num_trs = trs.length;
                        var i = 0;
                        async.eachSeries(trs, function (tr, doneOneTr) {
                            var pv = {};
                            i++;
                            if (i > 2) {
                                tr.findElements(webdriver.By.css('td')).then(function (tds) {
                                    var num_tds = tds.length;
                                    if (num_tds == 8) {
                                        async.parallel({
                                            one: function (b) {
                                                tds[3].getText().then(function (text) {
                                                    pv['valueMeaningName'] = text;
                                                    pv['permissibleValue'] = text;
                                                    b();
                                                });
                                            },
                                            two: function (b) {
                                                tds[5].getText().then(function (text) {
                                                    pv['valueMeaningCode'] = text;
                                                    b();
                                                });
                                            }
                                        }, function () {
                                            pvs.push(pv);
                                            doneOneTr();
                                        });
                                    }
                                    else if (num_tds == 9) {
                                        async.parallel({
                                            one: function (b) {
                                                tds[3].getText().then(function (text) {
                                                    pv['valueMeaningName'] = text;
                                                    b();
                                                });
                                            },
                                            two: function (b) {
                                                tds[5].getText().then(function (text) {
                                                    pv['permissibleValue'] = text;
                                                    pv['valueMeaningCode'] = text;
                                                    b();
                                                });
                                            },
                                            three: function (b) {
                                                tds[7].getText().then(function (text) {
                                                    pv['valueMeaningCode'] = text;
                                                    b();
                                                });
                                            }
                                        }, function () {
                                            pvs.push(pv);
                                            doneOneTr();
                                        });
                                    }
                                    else
                                        doneOneTr();
                                });
                            }
                            else {
                                doneOneTr();
                            }
                        }, function doneAllTrs() {
                            console.log("finished PVs");
                            doneParsingAllPermissibleValues();
                        })
                    })
                }
            }, function doneAllParsing() {
                var valueDomain = {};
                valueDomain['permissibleValues'] = pvs;
                var o = {};
                o['naming'] = naming;
                o['valueDomain'] = valueDomain;
                o['ids'] = ids;
                o['classification'] = cde.get('classification');

                mongo_cde.create(o, user, function () {
                    cdeCounter++;
                    console.log("finished cde: " + cdeCounter);
                    doneOneCde();
                });
            });
        }, function doneAllCdes() {
            var obj = {};
            obj['skipShortNameMap'] = Object.keys(skipShortNameMap);
            var cache = new Cache(obj);
            cache.save(function () {
                driver.quit();
                console.log("finished all cdes: " + cdeCounter);
                console.log("done step 4");
                doneStep4();
            })
        })

    })
};
var wipeDB = function (cb) {
    async.parallel({
            wipeDateElement: function (doneWipeDataElement) {
                DataElement.remove(function (err) {
                    if (err) throw err;
                    console.log("done wipe DataElement");
                    doneWipeDataElement();
                });
            },
            wipeCache: function (doneWipeCache) {
                Cache.remove(function (err) {
                    if (err) throw err;
                    console.log("done wipe Cache");
                    doneWipeCache();
                });
            },
            wipeForm: function (doneWipeForm) {
                Form.remove(function (err) {
                    if (err) throw err;
                    console.log("done wipe Form");
                    doneWipeForm();
                });
            },
            wipeMeasure: function (doneWipeMeasure) {
                Measure.remove(function (err) {
                    if (err) throw err;
                    console.log("done wipe Measure");
                    doneWipeMeasure();
                });
            },
            wipeCde: function (doneWipeCde) {
                Cde.remove(function (err) {
                    if (err) throw err;
                    console.log("done wipe Cde");
                    doneWipeCde();
                });
            }
        },
        function doneWipeAllDB() {
            console.log("done step1: wipe all db");
            cb();
        })
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
    /*
     function (doneWipeAllDB) {
     wipeDB(doneWipeAllDB);
     },
     */
    /*function (doneStep1) {
     step1(doneStep1);
     },

     function (doneStep2) {
     step2(doneStep2);
     },

     function (doneStep3) {
     step3(doneStep3);
     },*/
    function (doneStep4) {
        step4(doneStep4);
    },

    function (doneCleanUp) {
        process.exit(1);
    }
]);




