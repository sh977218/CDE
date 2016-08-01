var async = require('async');
var By = require('selenium-webdriver').By;

exports.parseMemberOfThesePanelsTable = function (obj, task, table, cb) {
    var sectionName = task.sectionName;
    var memberOfThesePanelsArray = [];
    table.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        async.forEach(trs, function (tr, doneOneTr) {
            var panel = {};
            tr.findElements(By.xpath('td')).then(function (tds) {
                async.parallel([
                    function (cb) {
                        tds[1].getText().then(function (idText) {
                            panel.ID = idText.trim();
                            cb();
                        });
                    },
                    function (cb) {
                        tds[2].getText().then(function (panelNameText) {
                            panel.PanelName = panelNameText.trim();
                            cb();
                        });
                    },
                    function (cb) {
                        tds[1].findElement(By.xpath('a')).then(function (a) {
                            a.getAttribute('href').then(function (urlText) {
                                panel.URL = urlText.trim();
                                cb();
                            });
                        });
                    }
                ], function () {
                    memberOfThesePanelsArray.push(panel);
                    doneOneTr();
                });

            });
        }, function doneAllTrs() {
            obj[sectionName][sectionName] = memberOfThesePanelsArray;
            cb();
        });
    });
};