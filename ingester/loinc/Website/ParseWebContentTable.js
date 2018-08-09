var async = require('async');
var By = require('selenium-webdriver').By;

exports.parseWebContentTable = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        var webContentsArray = [];
        var finishedOneWebContent = true;
        var i = 0;
        var oneWebContent = [];
        async.forEachSeries(trs, function (tr, doneOneTr) {
            tr.getAttribute('class').then(function (classes) {
                if (classes.indexOf('half_space') !== -1) {
                    if (oneWebContent.length === 2) {
                        var d = {};
                        async.parallel([
                            function (doneDescription) {
                                oneWebContent[0].getText().then(function (text) {
                                    d.Copyright = text.trim();
                                    doneDescription();
                                })
                            },
                            function (doneDescriptionLink) {
                                oneWebContent[0].findElements(By.css('a')).then(function (as) {
                                    if (as.length === 1) {
                                        as[0].getAttribute('href').then(function (link) {
                                            d.CopyrightLink = link.trim();
                                            doneDescriptionLink();
                                        })
                                    } else doneDescriptionLink();
                                })
                            },
                            function (doneSource) {
                                oneWebContent[1].getText().then(function (text) {
                                    d.Source = text.trim();
                                    doneSource();
                                })
                            },
                            function (doneSourceLink) {
                                oneWebContent[1].findElements(By.css('a')).then(function (as) {
                                    if (as.length === 1) {
                                        as[0].getAttribute('href').then(function (link) {
                                            d.SourceLink = link.trim();
                                            doneSourceLink();
                                        })
                                    } else doneSourceLink();
                                })
                            }
                        ], function doneOneWebContent() {
                            webContentsArray.push(d);
                            oneWebContent = [];
                            finishedOneWebContent = true;
                            i++;
                            doneOneTr();
                        })
                    } else {
                        i++;
                        doneOneTr();
                    }
                } else {
                    oneWebContent.push(tr);
                    finishedOneWebContent = false;
                    i++;
                    doneOneTr();
                }
            });
        }, function doneAllTrs() {
            obj[sectionName][sectionName] = webContentsArray;
            cb();
        });
    });
};