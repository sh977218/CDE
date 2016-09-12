var async = require('async');
var By = require('selenium-webdriver').By;

exports.parseArticleTable = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        var articleArray = [];
        var finishedOneArticle = true;
        var i = 0;
        var oneArticle = [];
        async.forEachSeries(trs, function (tr, doneOneTr) {
            tr.getAttribute('class').then(function (classes) {
                if (classes.indexOf('half_space') !== -1) {
                    if (oneArticle.length === 2) {
                        var d = {};
                        async.parallel([
                            function (doneDescription) {
                                oneArticle[0].getText().then(function (text) {
                                    d.Description = text.trim();
                                    doneDescription();
                                })
                            },
                            function (doneDescriptionLink) {
                                oneArticle[0].findElements(By.css('a')).then(function (as) {
                                    if (as.length === 1) {
                                        as[0].getAttribute('href').then(function (link) {
                                            d.DescriptionLink = link.trim();
                                            doneDescriptionLink();
                                        })
                                    } else doneDescriptionLink();
                                })
                            },
                            function (doneSource) {
                                oneArticle[1].getText().then(function (text) {
                                    d.Source = text.trim();
                                    doneSource();
                                })
                            },
                            function (doneSourceLink) {
                                oneArticle[1].findElements(By.css('a')).then(function (as) {
                                    if (as.length === 1) {
                                        as[0].getAttribute('href').then(function (link) {
                                            d.SourceLink = link.trim();
                                            doneSourceLink();
                                        })
                                    } else doneSourceLink();
                                })
                            }
                        ], function doneoneArticle() {
                            articleArray.push(d);
                            oneArticle = [];
                            finishedOneArticle = true;
                            i++;
                            doneOneTr();
                        })
                    } else {
                        i++;
                        doneOneTr();
                    }
                } else {
                    oneArticle.push(tr);
                    finishedOneArticle = false;
                    i++;
                    doneOneTr();
                }
            });
        }, function doneAllTrs() {
            obj[sectionName][sectionName] = articleArray;
            cb();
        });
    });
};