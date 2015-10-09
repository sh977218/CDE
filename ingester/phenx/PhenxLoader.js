var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until,
    fs = require('fs'),
    mongoose = require('mongoose'),
    config = require('../../modules/system/node-js/parseConfig'),
    cde_schemas = require('../../modules/cde/node-js/schemas'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    async = require('async');

// global variables
var baseUrl = "https://www.phenxtoolkit.org/index.php?pageLink=browse.measures&tree=off";
var mongoUrl = config.mongoUri.replace('test', 'migration');
var conn = mongoose.createConnection(mongoUrl, {auth: {authdb: "admin"}});
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
skipShortNameMap['http://r.details.loinc.org/LOINC/46098-0.html?sections=Comprehensive'] = true;
skipShortNameMap['http://r.details.loinc.org/LOINC/52458-7.html?sections=Comprehensive'] = true;
skipShortNameMap['http://r.details.loinc.org/LOINC/52797-8.html?sections=Comprehensive'] = true;


var step1 = function () {
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
                                obj['classification'] = classification;
                                doneParsingClassification();
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
                }
            )
        }
    );
};

var step2 = function () {
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
            obj['measures'] = measureCounter;
            obj['protocols'] = protocolCounter;
            var cache = new Cache(obj);
            cache.save(function () {
                driver.quit();
                console.log('saved log into cache collection');
                process.exit(0);
            });
        });
    })
};

var step3 = function () {
    var loincCounter = 0;
    var cdeCounter = 0;
    var formCounter = 0;
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
                                            var newCde = new Cde(cde);
                                            newCde.save(function () {
                                                cdeCounter++;
                                                console.log('finish saving cde ' + cdeCounter);
                                                doneOneTr();
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
            console.log("finished all loincCounter: " + loincCounter);
            driver.quit();
        });
    });
};

var step4 = function () {
    var cdeCounter = 0;
    Cde.find({}, function (err, cdes) {
        if (err) throw err;
        var driver = new webdriver.Builder().forBrowser('firefox').build();
        async.eachSeries(cdes, function (cde, doneOneCde) {
            var skipShortName = false;
            var href = cde.get('href');
            var classification = cde.get('classification');
            console.log(href);
            if (skipShortNameMap[href.trim()] === true)
                skipShortName = true;
            driver.get(href);
            var naming = [];
            var pvs = [];
            async.parallel({
                parsingName: function (doneParsingAllNames) {
                    driver.findElements(webdriver.By.xpath("//*[@class='Section1000000F00']/table/tbody/tr[td]")).then(function (trs) {
                        if (trs.length == 2) {
                            skipShortName === true;
                            skipShortNameMap[href] = true;
                        }
                        async.parallel({
                            parsingFullySpecifiedName: function (doneParsingFullySpecifiedName) {
                                var name = {};
                                driver.findElements(webdriver.By.xpath("/html/body/div[2]/table/tbody/tr[2]/td[3]/table/tbody/tr[2]/td[1]")).then(function (text) {
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
                                if (skipShortName) {
                                    doneParsingQuestionName();
                                }
                                else {
                                    var name = {};
                                    driver.findElements(webdriver.By.xpath("/html/body/div[5]/table/tbody/tr[2]/td[3]")).then(function (text) {
                                        var context = {};
                                        context['contextName'] = 'Question';
                                        name['designation'] = text;
                                        name['context'] = context;
                                        naming.push(name);
                                        doneParsingQuestionName();
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
                o['classification'] = classi;
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
                console.log("finished all cdes: " + cdeCounter);
                driver.quit();
            })
        })

    })
};

conn.on('error', function (err) {
    throw err;
});
conn.once('open', function callback() {
    console.log("connected to " + mongoUrl);
//    setTimeout(step1(), 3000);
//    setTimeout(step2(), 3000);
//    setTimeout(step3(), 3000);
    setTimeout(step4(), 3000);

});

