var async = require('async');
var By = require('selenium-webdriver').By;

exports.parseDefinitionDescriptionsTable = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        var definitionArray = [];
        var finishOneDefinition = true;
        var i = 0;
        var oneDefinition = [];
        async.forEachSeries(trs, function (tr, doneOneTr) {
            tr.getAttribute('class').then(function (classes) {
                if (classes.indexOf('half_space') !== -1) {
                    if (oneDefinition.length === 2) {
                        var d = {};
                        async.parallel([
                            function (doneDescription) {
                                oneDefinition[0].getText().then(function (text) {
                                    d.Description = text.trim();
                                    doneDescription();
                                })
                            },
                            function (doneSource) {
                                oneDefinition[1].getText().then(function (text) {
                                    d.Source = text.trim();
                                    doneSource();
                                })
                            },
                            function (doneSourceLink) {
                                oneDefinition[1].findElements(By.css('a')).then(function (as) {
                                    if (as.length === 1) {
                                        as[0].getAttribute('href').then(function (link) {
                                            d.SourceLink = link.trim();
                                            doneSourceLink();
                                        })
                                    } else doneSourceLink();
                                })
                            }], function doneOneDefinition() {
                            definitionArray.push(d);
                            oneDefinition = [];
                            finishOneDefinition = true;
                            i++;
                            doneOneTr();
                        })
                    } else if (oneDefinition.length === 3) {
                        var d = {};
                        async.parallel([
                            function (donePart) {
                                oneDefinition[0].getText().then(function (text) {
                                    d.Part = text.trim();
                                    donePart();
                                })
                            },
                            function (donePartLink) {
                                oneDefinition[0].findElements(By.css('a')).then(function (as) {
                                    if (as.length === 1) {
                                        as[0].getAttribute('href').then(function (link) {
                                            d.PartLink = link.trim();
                                            donePartLink();
                                        })
                                    } else donePartLink();

                                })
                            },
                            function (doneDescription) {
                                oneDefinition[1].getText().then(function (text) {
                                    d.Description = text.trim();
                                    doneDescription();
                                })
                            },
                            function (doneSource) {
                                oneDefinition[2].getText().then(function (text) {
                                    d.Source = text.trim();
                                    doneSource();
                                })
                            },
                            function (doneSourceLink) {
                                oneDefinition[2].findElements(By.css('a')).then(function (as) {
                                    if (as.length === 1) {
                                        as[0].getAttribute('href').then(function (link) {
                                            d.SourceLink = link.trim();
                                            doneSourceLink();
                                        })
                                    } else doneSourceLink();
                                })
                            }], function doneOneDefinition() {
                            definitionArray.push(d);
                            oneDefinition = [];
                            finishOneDefinition = true;
                            i++;
                            doneOneTr();
                        })
                    } else if (oneDefinition.length === 4) {
                        i++;
                        doneOneTr();
                    } else {
                        i++;
                        doneOneTr();
                    }
                } else {
                    oneDefinition.push(tr);
                    finishOneDefinition = false;
                    i++;
                    doneOneTr();
                }
            });
        }, function doneAllTrs() {
            obj[sectionName][sectionName] = definitionArray;
            cb();
        });
    });
};