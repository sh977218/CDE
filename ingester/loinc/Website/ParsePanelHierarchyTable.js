var async = require('async');
var By = require('selenium-webdriver').By;
var LoadFromLoincSite = require('./LOINCLoader');

exports.parsePanelHierarchyTable = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        trs.pop();
        var currentLevels = [];
        var currentDepth;
        async.forEachSeries(trs, function (tr, doneOneTr) {
            var row = {elements: []};
            var depth;
            tr.findElements(By.xpath('td')).then(function (tds) {
                async.series([
                    function getDepth (done) {
                        tds[1].findElement(By.xpath('span')).then(function (span) {
                            span.getText().then(function (spanText) {
                                span.findElement(By.xpath('a')).then(function (a) {
                                    a.getText().then(function (aText) {
                                        var spaces = spanText.replace(aText, '');
                                        depth = spaces.length / 5;
                                        done();
                                    });
                                });
                            });
                        });
                    },
                    function getLoincID (done) {
                        tds[1].getText().then(function (text) {
                            row['LOINC#'] = text.trim();
                            if (obj.loincId !== text.trim()) {
                                var idArray = [text.trim()];
                                LoadFromLoincSite.runArray(idArray, function (one, next) {
                                    next();
                                }, function () {
                                    done();
                                })
                            } else done();
                        });
                    },
                    function getLoincLink (done) {
                        tds[1].findElement(By.css('a')).then(function (a) {
                            a.getAttribute('href').then(function (url) {
                                row['link'] = url.trim();
                                done();
                            });
                        });
                    },
                    function (done) {
                        tds[2].getText().then(function (text) {
                            row['LOINC Name'] = text.trim();
                            done();
                        });
                    },
                    function (done) {
                        tds[3].getText().then(function (text) {
                            row['R/O/C '] = text.trim();
                            done();
                        });
                    },
                    function (done) {
                        tds[4].getText().then(function (text) {
                            row['Cardinality'] = text.trim();
                            done();
                        });
                    },
                    function (done) {
                        tds[5].getText().then(function (text) {
                            row['Ex UCUM Units'] = text.trim();
                            done();
                        });
                    }
                ], function () {
                    if (depth === 0) {
                        currentLevels[0] = row;
                        currentDepth = 0;
                    } else if (depth > currentDepth) {
                        currentLevels[currentDepth].elements.push(row);
                        currentLevels[depth] = row;
                        currentDepth = depth;
                    } else if (depth === currentDepth) {
                        currentLevels[depth - 1].elements.push(row);
                        currentLevels[depth] = row;
                    } else if(depth < currentDepth) {
                        currentLevels[currentDepth] = null;
                        currentLevels[depth] = row;
                        currentLevels[depth - 1].elements.push(row);
                        currentDepth = depth;
                    }
                    doneOneTr();
                });
            });
        }, function doneAllTrs() {
            obj[sectionName][sectionName] = currentLevels[0];
            cb();
        });
    });
};