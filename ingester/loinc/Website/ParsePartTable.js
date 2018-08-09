var async = require('async');
var By = require('selenium-webdriver').By;

exports.parsePartTable = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    obj[sectionName][sectionName] = [];
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        async.forEachSeries(trs, function (tr, doneOneTr) {
            var part = {};
            tr.findElements(By.xpath('td')).then(function (tds) {
                async.parallel([
                        function (doneOneTd) {
                            tds[0].getAttribute('innerHTML').then(function (text) {
                                part['Part Type'] = text.replace(/&nbsp;/g, '').trim();
                                doneOneTd();
                            })
                        },
                        function (doneTwoTd) {
                            tds[2].findElement(By.css('a')).then(function (a) {
                                async.parallel([
                                    function (doneID) {
                                        a.getAttribute('innerHTML').then(function (text) {
                                            part['Part No'] = text.trim();
                                            doneID();
                                        })
                                    },
                                    function (doneLink) {
                                        a.getAttribute('href').then(function (urlText) {
                                            part['Part No Link'] = urlText.trim();
                                            doneLink();
                                        });
                                    }
                                ], function () {
                                    doneTwoTd();
                                });
                            });

                        },
                        function (doneThreeTd) {
                            tds[3].getAttribute('innerHTML').then(function (text) {
                                part['Part Name'] = text.replace(/&nbsp;/g, '').trim();
                                doneThreeTd();
                            })
                        }
                    ],
                    function () {
                        obj[sectionName][sectionName].push(part);
                        doneOneTr();
                    })
            })
        }, function doneAllTrs() {
            cb();
        })
    })
};
