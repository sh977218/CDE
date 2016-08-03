var async = require('async');
var By = require('selenium-webdriver').By;

exports.parseExampleUnitsTable = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    var exampleUnitsArray = [];
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        trs.shift();
        async.forEach(trs, function (tr, doneOneTr) {
            var exampleUnit = {};
            tr.findElements(By.xpath('td')).then(function (tds) {
                async.parallel([
                    function (cb) {
                        tds[1].getText().then(function (unitText) {
                            exampleUnit.Unit = unitText.trim();
                            cb();
                        });
                    },
                    function (cb) {
                        tds[2].getText().then(function (sourceTypeText) {
                            exampleUnit['Source Type'] = sourceTypeText.trim();
                            cb();
                        });
                    }
                ], function () {
                    exampleUnitsArray.push(exampleUnit);
                    doneOneTr();
                });
            });
        }, function doneAllTrs() {
            obj[sectionName][sectionName] = exampleUnitsArray;
            cb();
        });
    });
};