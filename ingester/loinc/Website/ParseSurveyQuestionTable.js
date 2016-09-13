var async = require('async');
var webdriver = require('selenium-webdriver');
var By = webdriver.By;

exports.parseSurveyQuestionTable = function (obj, task, table, cb) {
    var sectionName = task.sectionName;
    var surveyQuestionObj = {};
    table.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        async.forEach(trs, function (tr, doneOneTr) {
            tr.findElements(By.xpath('td')).then(function (tds) {
                tds[1].getText().then(function (keyText) {
                    tds[2].getText().then(function (valueText) {
                        surveyQuestionObj[keyText.replace(/:/g, '').trim()] = valueText.trim();
                        doneOneTr();
                    });
                });
            });
        }, function doneAllTrs() {
            obj[sectionName][sectionName] = surveyQuestionObj;
            cb();
        });
    });
};