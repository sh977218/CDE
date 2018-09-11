const async = require('async');
const By = require('selenium-webdriver').By;

exports.parse3rdPartyCopyrightTable = function (obj, task, element, cb) {
    let sectionName = task.sectionName;
    let thirdPartyCopyrightNotice = '';
    element.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        trs.pop();
        if (trs.length % 2 !== 0) {
            consolog(obj.loincId + ' has odd 3rd party copyright');
            process.exit(1);
        }
        async.series([
            function (doneOne) {
                trs[0].getText().then(function (text) {
                    thirdPartyCopyrightNotice = thirdPartyCopyrightNotice + text;
                    doneOne();
                })
            },
            function (doneOne) {
                trs[1].getText().then(function (text) {
                    thirdPartyCopyrightNotice = thirdPartyCopyrightNotice + text;
                    doneOne();
                })
            }
        ], function () {
            obj[sectionName] = thirdPartyCopyrightNotice;
            cb();
        })
    });
};