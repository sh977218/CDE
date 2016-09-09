var async = require('async');
var By = require('selenium-webdriver').By;

exports.parseRelatedNamesTable = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    var relatedNamesArray = [];
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        async.forEach(trs, function (tr, doneOneTr) {
            tr.findElements(By.xpath('td')).then(function (tds) {
                tds.shift();
                async.forEach(tds, function (td, doneOneTd) {
                        td.getText().then(function (text) {
                            relatedNamesArray.push(text.trim());
                            doneOneTd();
                        });
                    },
                    function doneAllTds() {
                        doneOneTr();
                    });
            });
        }, function doneAllTrs() {
            obj[sectionName][sectionName] = relatedNamesArray;
            cb();
        });
    });
};