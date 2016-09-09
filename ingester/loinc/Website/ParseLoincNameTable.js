var async = require('async');
var By = require('selenium-webdriver').By;

exports.parseLoincNameTable = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    var loincName = {};
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        async.forEach(trs, function (tr, doneOneTr) {
            tr.findElements(By.xpath('td')).then(function (tds) {
                async.parallel([
                    function (doneOneTd) {
                        tds[0].getText().then(function (text) {
                            if (obj['loincId'] !== text.trim()) throw "LOINC ID does not match";
                            doneOneTd();
                        });
                    },
                    function (doneTwoTd) {
                        tds[1].getText().then(function (text) {
                            loincName[sectionName] = text.trim();
                            tds[1].findElements(By.xpath('span/span')).then(function (spans) {
                                loincName.HiddenNames = [];
                                async.parallel([
                                    function (doneOneSpan) {
                                        spans[0].getAttribute('innerHTML').then(function (text) {
                                            loincName.HiddenNames.push(text.trim());
                                            doneOneSpan();
                                        })
                                    },
                                    function (doneTwoSpan) {
                                        spans[1].getAttribute('innerHTML').then(function (text) {
                                            loincName.HiddenNames.push(text.trim());
                                            doneTwoSpan();
                                        })
                                    },
                                    function (doneThreeSpan) {
                                        spans[2].getAttribute('innerHTML').then(function (text) {
                                            loincName.HiddenNames.push(text.trim());
                                            doneThreeSpan();
                                        })
                                    }
                                ], function () {
                                    doneTwoTd();
                                })
                            });
                        });
                    },
                    function (doneThreeTd) {
                        tds[2].getText().then(function (text) {
                            doneThreeTd();
                        });
                    }
                ], function () {
                    doneOneTr();
                })
            });
        }, function doneAllTrs() {
            obj[sectionName][sectionName] = loincName;
            cb();
        });
    })
};