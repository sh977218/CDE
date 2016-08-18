var async = require('async');
var By = require('selenium-webdriver').By;

exports.parsePanelHierarchyTable = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    var PanelHierarchyArray = [];
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        trs.pop();
        var elements = [];
        async.forEachSeries(trs, function (tr, doneOneTr) {
            var row = {elements: []};
            var depth = 0;
            var endLevel = false;
            tr.findElements(By.xpath('td')).then(function (tds) {
                async.series([
                    function (done) {
                        tds[1].findElement(By.xpath('span')).then(function (span) {
                            span.getText().then(function (spanText) {
                                span.findElement(By.xpath('a')).then(function (a) {
                                    a.getText().then(function (aText) {
                                        var lastDepth = depth;
                                        var spaces = spanText.replace(aText, '');
                                        depth = spaces.length / 5;
                                        if (lastDepth === depth) {
                                            endLevel = true;
                                        }
                                        done();
                                    })
                                });
                            });
                        })
                    },
                    function (done) {
                        tds[1].getText().then(function (text) {
                            row['LOINC#'] = text.trim();
                            done();
                        })
                    },
                    function (done) {
                        tds[1].findElement(By.css('a')).then(function (a) {
                            a.getAttribute('href').then(function (url) {
                                row['link'] = url.trim();
                                done();
                            })
                        })
                    },
                    function (done) {
                        tds[2].getText().then(function (text) {
                            row['LOINC Name'] = text.trim();
                            done();
                        })
                    },
                    function (done) {
                        tds[3].getText().then(function (text) {
                            row['R/O/C '] = text.trim();
                            done();
                        })
                    },
                    function (done) {
                        tds[4].getText().then(function (text) {
                            row['Cardinality'] = text.trim();
                            done();
                        })
                    },
                    function (done) {
                        tds[5].getText().then(function (text) {
                            row['Ex UCUM Units'] = text.trim();
                            done();
                        })
                    }
                ], function () {
                    var temp;
                    if (depth === 0) {
                        PanelHierarchyArray.push(row);
                        temp = row;
                    } else if (depth === 1) {
                        temp.elements.push(row);
                    } else if (depth === 2) {
                        elements.push(row);
                    } else if (depth === 3) {
                        elements.push(row);
                    }
                    if (endLevel) {
                        elements = [];
                    }
                    doneOneTr();
                })
            });
        }, function doneAllTrs() {
            obj[sectionName][sectionName] = PanelHierarchyArray;
            cb();
        });
    })
};