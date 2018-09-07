const async = require('async');
const By = require('selenium-webdriver').By;

exports.parse3rdPartyCopyrightTable = function (obj, task, element, cb) {
    let sectionName = task.sectionName;
    obj[sectionName] = {};
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        trs.pop();
        if (trs.length % 2 !== 0) {
            consolog(obj.loincId + ' has odd 3rd party copyright');
            process.exit(1);
        }
        async.forEachSeries([
            function (doneOne) {
                trs[0].getText().then(function (text) {
                    obj[sectionName].codeSystem = text;
                    doneOne();
                })
            },
            function (doneOne) {
                trs[1].getText().then(function (text) {
                    obj[sectionName].text = text;
                    doneOne();
                })
            }
        ], function () {
            cb();
        })
    });
};