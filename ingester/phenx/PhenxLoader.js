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
var measureCounter = 0;
var protocolCounter = 0;
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
    Cache.find({}, function (err, caches) {
        if (err) throw err;
        var driver = new webdriver.Builder().forBrowser('firefox').build();
        async.eachSeries(caches, function (cache, doneOneCache) {
            var href1 = cache.get('href1');
            var href2 = [];
            driver.get(href1);
            driver.findElements(webdriver.By.xpath("//*[@id='browse_measure_protocol_list']/table/tbody/tr/td/div/div[@class='search']/a[2]")).then(function (links) {
                async.eachSeries(links, function (link, doneOneLink) {
                    links.getAttribute('href').then(function (text) {
                        href2.push(text);
                        doneOneLink();
                    })
                }, function doneAllLinks() {
                    cache.set('href2', href2);
                    cache.save(function () {
                        counter++;
                        console.log("saved " + counter);
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
    Cache.find({}, function (err, caches) {
        if (err) throw err;
        var driver = new webdriver.Builder().forBrowser('firefox').build();
        async.eachSeries(caches, function (cache, doneOneCache) {
            var href2 = cache.get('href2');
            var protocols = [];
            protocolCounter = 0;
            async.eachSeries(href2, function (href, doneOneHref2) {
                driver.get(href);
                driver.findElement(webdriver.By.id('button_showfull')).click().then(function () {
                    var protocol = {};
                    driver.findElements(webdriver.By.xpath("//*[contains(@id,'label')]")).then(function (labels) {
                        async.eachSeries(labels, function (label, doneOneLabel) {
                            label.getAttribute('id').then(function (id) {
                                label.getText().then(function (key) {
                                    var newId = id.replace('label', 'element');
                                    driver.findElement(webdriver.By.id(newId)).getText().then(function (text) {
                                        protocol[key.trim()] = text;
                                        doneOneLabel();
                                    })
                                })
                            });
                        }, function donAllLabels() {
                            protocols.push(protocol);
                            protocolCounter++;
                            console.log('finished protocol ' + protocolCounter);
                            doneOneHref2();
                        });
                    })
                });
            }, function doneAllHref2() {
                cache.set('protocols', protocols);
                cache.save(function () {
                    measureCounter++;
                    console.log('finished measure ' + measureCounter);
                    doneOneCache()
                });
            });
        }, function doneAllCaches() {
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
    setTimeout(step2(), 3000);
//    setTimeout(step3(), 3000);
});

