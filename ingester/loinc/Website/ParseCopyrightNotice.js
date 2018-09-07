const async = require('async');
const By = require('selenium-webdriver').By;

exports.parseCopyrightNotice = async function (obj, task, element, cb) {
    let sectionName = task.sectionName;
    obj[sectionName] = {};
    element.findElements(By.xpath('(tbody/tr)[2]/td')).then(function (tds) {
        let td = tds[0];
        td.findElement(By.xpath('a')).then(function (a) {
            async.forEachSeries([
                function (doneOne) {
                    a.getText().then(function (text) {
                        obj[sectionName].text = text.trim();
                        doneOne();
                    })
                },
                function (doneOne) {
                    a.getAttribute('href').then(function (href) {
                        obj[sectionName].href = href;
                        doneOne();
                    })
                }

            ], function () {
                cb();
            })
        })
    })
};