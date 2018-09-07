const async = require('async');
const By = require('selenium-webdriver').By;

exports.parseCopyrightNotice = function (obj, task, element, cb) {
    let sectionName = task.sectionName;
    obj[sectionName] = {};
    element.findElements(By.xpath('(tbody/tr)[2]/td')).then(function (tds) {
        let td = tds[0];
        td.findElement(By.xpath('a')).then(function (a) {
            async.forEach([function (done) {
                a.getText().then(function (text) {
                    obj[sectionName].text = text.trim();
                    done();
                });
            }, function (done) {
                a.getTagName('href').then(function (href) {
                    obj[sectionName].href = href;
                    done();
                })
            }], function () {
                cb();
            })
        })
    });
};