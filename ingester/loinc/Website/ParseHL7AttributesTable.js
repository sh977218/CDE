var async = require('async');
var By = require('selenium-webdriver').By;

var utility = require('../Utility/utility');

exports.parseHL7AttributesTable = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    var basicAttributesObj = {};
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        async.forEach(trs, function (tr, doneOneTr) {
            tr.findElements(By.xpath('td')).then(function (tds) {
                var key = '';
                var value = '';
                async.series([
                    function (doneKey) {
                        tds[1].getText().then(function (keyText) {
                            key = utility.sanitizeText(keyText);
                            doneKey();
                        });
                    },
                    function (doneValue) {
                        tds[2].getText().then(function (valueText) {
                            value = valueText.trim();
                            doneValue();
                        });
                    }
                ], function () {
                    basicAttributesObj[key] = value;
                    doneOneTr();
                });
            });
        }, function doneAllTrs() {
            obj[sectionName][sectionName] = basicAttributesObj;
            cb();
        });
    });
};