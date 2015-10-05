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
                driver.findElement(webdriver.By.xpath('//*[@id="browse_measure_protocol_list"]/table/tbody/tr/td/div/div/a[2]/@href')).getText().then(function (text) {
                    var href2 = 'https://www.phenxtoolkit.org/' + text;
                    obj['href2'] = href2;
                    driver.get(href2);
                    async.parallel({
                        one: function (callback) {
                            driver.findElement(webdriver.By.id('element_RELEASE_DATE')).getText().then(function (text) {
                                obj['Protocol Release Date'] = text;
                                callback();
                            });
                        },
                        two: function (callback) {
                            driver.findElement(webdriver.By.id('element_PROTOCOL_NAME_FROM_SOURCE')).getText().then(function (text) {
                                obj['Protocol Name From Source'] = text;
                                callback();
                            });
                        },
                        three: function (callback) {
                            driver.findElement(webdriver.By.id('element_DESCRIPTION')).getText().then(function (text) {
                                obj['Description of Protocol'] = text;
                                callback();
                            });
                        },

                        four: function (callback) {
                            driver.findElement(webdriver.By.id('element_SPECIFIC_INSTRUCTIONS')).getText().then(function (text) {
                                obj['Specific Instructions'] = text;
                                callback();
                            });
                        },
                        five: function (callback) {
                            driver.findElement(webdriver.By.id('element_PROTOCOL_TEXT')).getText().then(function (text) {
                                obj['Protocol '] = text;
                                callback();
                            });
                        },
                        six: function (callback) {
                            driver.findElement(webdriver.By.id('element_SELECTION_RATIONALE')).getText().then(function (text) {
                                obj['Selection Rationale'] = text;
                                callback();
                            });
                        },
                        seven: function (callback) {
                            driver.findElement(webdriver.By.id('element_LIFESTAGE')).getText().then(function (text) {
                                obj['Life Stage'] = text;
                                callback();
                            });
                        },
                        eight: function (callback) {
                            driver.findElement(webdriver.By.id('element_LANGUAGE')).getText().then(function (text) {
                                obj['Language  '] = text;
                                callback();
                            });
                        },
                        nine: function (callback) {
                            driver.findElement(webdriver.By.id('element_PARTICIPANT')).getText().then(function (text) {
                                obj['Participant'] = text;
                                callback();
                            });
                        },
                        ten: function (callback) {
                            driver.findElement(webdriver.By.id('element_PERSONNEL_AND_TRAINING_REQD')).getText().then(function (text) {
                                obj['Personnel and Training Required'] = text;
                                callback();
                            });
                        },
                        eleven: function (callback) {
                            driver.findElement(webdriver.By.id('element_EQUIPMENT_NEEDS')).getText().then(function (text) {
                                obj['Equipment Needs'] = text;
                                callback();
                            });
                        },
                        twelve: function (callback) {
                            driver.findElement(webdriver.By.id('element_STANDARDS')).getText().then(function (text) {
                                obj['Standards'] = text;
                                callback();
                            });
                        },
                        thirteen: function (callback) {
                            driver.findElement(webdriver.By.id('element_REFERENCES')).getText().then(function (text) {
                                obj['General References'] = text;
                                callback();
                            });
                        },
                        fourteen: function (callback) {
                            driver.findElement(webdriver.By.id('element_PROTOCOL_TYPE')).getText().then(function (text) {
                                obj['Mode of Administration'] = text;
                                callback();
                            });
                        },
                        fifteen: function (callback) {
                            driver.findElement(webdriver.By.id('element_DERIVED_VARIABLES')).getText().then(function (text) {
                                obj['Derived Variables'] = text;
                                callback();
                            });
                        },
                        sixteen: function (callback) {
                            driver.findElement(webdriver.By.id('element_REQUIREMENTS')).getText().then(function (text) {
                                obj['Requirements '] = text;
                                callback();
                            });
                        },
                        seventeen: function (callback) {
                            driver.findElement(webdriver.By.id('element_PROCESS_REVIEW')).getText().then(function (text) {
                                obj['Process and Review '] = text;
                                callback();
                            });
                        }
                    }, function (err, results) {
                        var measure = new Cache(obj);
                        measure.save(function (err) {
                            if (err) throw err;
                            counter++;
                            console.log("measure " + counter + " finished.");
                            doneOneTask();
                        })
                    });

                });
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

var conn = mongoose.createConnection(mongoUrl, {auth: {authdb: "admin"}});
conn.on('error', function (err) {
    throw err;
});
conn.once('open', function callback() {
    console.log("connected to " + mongoUrl);
    setTimeout(init(), 3000);
});

