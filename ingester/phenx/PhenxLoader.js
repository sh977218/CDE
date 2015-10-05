var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until,
    fs = require('fs'),
    mongoose = require('mongoose'),
    config = require('../../modules/system/node-js/parseConfig'),
    async = require('async');

// global variables
var mongoUrl = config.mongoUri;
var allTasks = [];
var init = function () {
    var driver = new webdriver.Builder().forBrowser('firefox').build();
    var baseUrl = "https://www.phenxtoolkit.org/index.php?pageLink=browse.measures&tree=off";
    var user = {username: "batchloader"};
    var xpaths = ["//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td[1]/div/div", "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td[2]/div/div"];
    var counter = 0;
    driver.get(baseUrl);
    var cacheSchema = mongoose.Schema({}, {strict: false});
    var Cache = conn.model('cache', cacheSchema);
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
                driver.get(task);
                driver.findElement(webdriver.By.xpath('//*[@id="browse_measure_protocol_list"]/table/tbody/tr/td/div/div/a[2]')).then(function (link) {
                    link.getAttribute('href').then(function (text) {
                        obj['href2'] = text;
                        obj['done'] = false;
                    });
                });
            }),
                function doneAllTasks() {
                    driver.quit();
                    var cache = new Cache(obj);
                    cache.save();
                    conn.close(function (err) {
                        if (err) throw err;
                    });
                    console.log('finished all measures.');
                }
        }
    );
};

var conn = mongoose.createConnection(mongoUrl, {auth: {authdb: "admin"}});
conn.on('error', function (err) {
    throw err;
});
conn.once('open', function callback() {
    console.log("connected to " + mongoUrl);
    setTimeout(init(), 3000);
});

