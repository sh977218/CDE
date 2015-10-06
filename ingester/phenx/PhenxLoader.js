var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until,
    fs = require('fs'),
    mongoose = require('mongoose'),
    config = require('../../modules/system/node-js/parseConfig'),
    async = require('async');

// global variables
var baseUrl = "https://www.phenxtoolkit.org/index.php?pageLink=browse.measures&tree=off";
var mongoUrl = config.mongoUri;
var conn = mongoose.createConnection(mongoUrl, {auth: {authdb: "admin"}});
var cacheSchema = mongoose.Schema({}, {strict: false});
var Cache = conn.model('cache', cacheSchema);
var user = {username: "batchloader"};
var cdeBrowsers = [];
var loinc = [];

var allTasks = [];
var step1 = function () {
    var xpaths = ["//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td[1]/div/div", "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td[2]/div/div"];
    driver.get(baseUrl);
    async.eachSeries(xpaths, function (xpath, doneOneXpath) {
            driver.findElements(webdriver.By.xpath(xpath)).then(function (links) {
                async.eachSeries(links, function (link, doneOneLink) {
                    link.findElements(webdriver.By.css('a')).then(function (hrefs) {
                        hrefs[1].getAttribute('href').then(function (text) {
                            allTasks.push(text);
                            doneOneLink();
                        });
                    })
                }, function doneAllLinks() {
                    console.log('finished some measures.');
                    doneOneXpath();
                });
            });
        }, function doneAllXpaths() {
            console.log("there are " + allTasks.length + " sites need to go.");
            async.eachSeries(allTasks, function (task, doneOneTask) {
                var obj = {};
                obj['href1'] = task;
                var cache = new Cache(obj);
                cache.save();
                doneOneTask();
            }),
                function doneAllTasks() {
                    driver.quit();
                    conn.close(function (err) {
                        if (err) throw err;
                    });
                    console.log('finished all measures.');
                }
        }
    );
};

var step2 = function () {
    var measureCounter = 0;
    var protocolCounter = 0;
    Cache.find({}, function (err, caches) {
        if (err) throw err;
        var driver = new webdriver.Builder().forBrowser('firefox').build();
        async.eachSeries(caches, function (cache, doneOneCache) {
            var href1 = cache.get('href1');
            var href2 = [];
            driver.get(href1);
            driver.findElements(webdriver.By.xpath("//*[@id='browse_measure_protocol_list']/table/tbody/tr/td/div/div[@class='search']/a[2]")).then(function (links) {
                async.eachSeries(links, function (link, doneOneLink) {
                    link.getAttribute('href').then(function (text) {
                        href2.push(text);
                        protocolCounter++;
                        console.log("finished protocol " + protocolCounter);
                        doneOneLink();
                    })
                }, function doneAllLinks() {
                    cache.set('href2', href2);
                    cache.save(function () {
                        measureCounter++;
                        console.log("finished measure " + measureCounter);
                        doneOneCache();
                    });
                });
            });
        }, function doneAllCache() {
            driver.quit();
            console.log('finished all');
        });
    })
};

var step3 = function () {
    var measureCounter = 0;
    var protocolCounter = 0;
    Cache.find({}, function (err, caches) {
        if (err) throw err;
        var driver = new webdriver.Builder().forBrowser('firefox').build();
        async.eachSeries(caches, function (cache, doneOneCache) {
            var href2 = cache.get('href2');
            var protocols = [];
            async.eachSeries(href2, function (href, doneOneProtocol) {
                driver.get(href);
                driver.findElement(webdriver.By.id('button_showfull')).click().then(function () {
                    var protocol = {};
                    driver.findElements(webdriver.By.xpath("//*[contains(@id,'label')]")).then(function (labels) {
                        async.eachSeries(labels, function (label, doneOneLabel) {
                            label.getAttribute('id').then(function (id) {
                                label.getText().then(function (key) {
                                    var newId = id.replace('label', 'element');
                                    if (newId.indexOf('STANDARDS') > -1) {
                                        var standards = [];
                                        driver.findElements(webdriver.By.xpath("//*[@id='" + newId + "']//table/tbody/tr[td]")).then(function (trs) {
                                            var standard = {};
                                            async.eachSeries(trs, function (tr, doneOneTr) {
                                                tr.findElements(webdriver.By.css('td')).then(function (tds) {
                                                    async.parallel({
                                                        one: function (cb) {
                                                            tds[0].getText().then(function (text) {
                                                                standard['Standard'] = text;
                                                                cb();
                                                            })
                                                        },
                                                        two: function (cb) {
                                                            tds[1].getText().then(function (text) {
                                                                standard['Name'] = text;
                                                                cb();
                                                            })
                                                        },
                                                        three: function (cb) {
                                                            tds[2].getText().then(function (text) {
                                                                standard['ID'] = text;
                                                                cb();
                                                            })
                                                        },
                                                        four: function (cb) {
                                                            var source = {};
                                                            tds[3].getText().then(function (text) {
                                                                source['text'] = text;
                                                                tds[3].findElement(webdriver.By.css('a')).then(function (a) {
                                                                    a.getAttribute('href').then(function (href) {
                                                                        source['href'] = href;
                                                                        if (source['text'] === 'CDE Browser') {
                                                                            cdeBrowsers.push(href);
                                                                        }
                                                                        if (source['text'] === 'LOINC') {
                                                                            loinc.push(href);
                                                                        }
                                                                        standard['Source'] = source;
                                                                        cb();
                                                                    })
                                                                })
                                                            })
                                                        }
                                                    }, function doneAllTds() {
                                                        standards.push(standard);
                                                        doneOneTr();
                                                    })
                                                });
                                            }, function doneAllTrs() {
                                                protocol['Standards'] = standards;
                                                doneOneLabel();
                                            });
                                        })
                                    }
                                    else if (newId.indexOf('REQUIREMENTS') > -1) {
                                        var requirements = [];
                                        driver.findElements(webdriver.By.xpath("//*[@id='" + newId + "']//table/tbody/tr[td]")).then(function (trs) {
                                            var requirement = {};
                                            async.eachSeries(trs, function (tr, doneOneTr) {
                                                tr.findElements(webdriver.By.css('td')).then(function (tds) {
                                                    async.parallel({
                                                            one: function (cb) {
                                                                tds[0].getText().then(function (text) {
                                                                    requirement['Requirement Category'] = text;
                                                                    cb();
                                                                })
                                                            },
                                                            two: function (cb) {
                                                                tds[1].getText().then(function (text) {
                                                                    requirement['Required'] = text;
                                                                    cb();
                                                                })
                                                            }
                                                        }
                                                        , function doneAllTds() {
                                                            requirements.push(requirement);
                                                            doneOneTr();
                                                        })
                                                });
                                            }, function doneAllTrs() {
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
                            protocols.push(protocol);
                            protocolCounter++;
                            console.log('finished protocol ' + protocolCounter);
                            doneOneProtocol();
                        });
                    })
                });
            }, function doneAllProtocols() {
                cache.set('protocols', protocols);
                cache.save(function () {
                    measureCounter++;
                    console.log('finished measure ' + measureCounter);
                    doneOneCache()
                });
            });
        }, function doneAllCaches() {
            var obj = {};
            obj['cdeBrowser'] = cdeBrowsers;
            obj['loinc'] = loinc;
            obj['log'] = true;
            var cache = new Cache(obj);
            cache.save();
            console.log('finished all');
            driver.quit();
        });
    })
};

conn.on('error', function (err) {
    throw err;
});
conn.once('open', function callback() {
    console.log("connected to " + mongoUrl);
//    setTimeout(step1(), 3000);
//    setTimeout(step2(), 3000);
    setTimeout(step3(), 3000);
});

