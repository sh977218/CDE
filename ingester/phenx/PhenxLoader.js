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
var driver = new webdriver.Builder().forBrowser('firefox').build();
var user = {username: "batchloader"};

var allTasks = [];
var step1 = function () {
    var xpaths = ["//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td[1]/div/div", "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td[2]/div/div"];
    var counter = 0;
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
                obj['done'] = false;
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
        async.eachSeries(caches, function (cache, doneOne) {
            var href1 = cache.get('href1');
            driver.get(href1);
            var href2 = [];
            driver.findElements(webdriver.By.xpath("//*[@id='browse_measure_protocol_list']/table/tbody/tr")).then(function (trs) {
                async.eachSeries(trs, function (tr, doneOneTr) {
                    tr.findElement(webdriver.By.css('a')).then(function (links) {
                        links[1].getAttribute('href').then(function (text) {
                            href2.push(text);
                            doneOneTr();
                        })
                    });
                }, function doneAllTrs() {
                    cache['href2'] = href2;
                    cache.save(function () {
                        doneOne();
                    });
                });
            });
        }, function doneAll() {
            console.log('finished all');
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
});

