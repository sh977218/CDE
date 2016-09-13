var async = require('async');
var By = require('selenium-webdriver').By;

exports.parseLanguageVariantsTable = function (obj, task, table, cb) {
    var sectionName = task.sectionName;
    var languageVariantsArray = [];
    table.findElements(By.xpath('tbody/tr')).then(function (trs) {
        trs.shift();
        var languageArray = [];
        for (var i = 0; i < trs.length / 2; i++) {
            languageArray.push({
                languageTitle: trs[2 * i],
                languageDetail: trs[2 * i + 1]
            });
        }
        async.forEach(languageArray, function (languge, doneOneLanguage) {
            var languageVariant = {};
            async.parallel([
                function (cb) {
                    languge.languageTitle.getText().then(function (text) {
                        languageVariant.VariantKey = text.trim();
                        cb();
                    });
                },
                function (cb) {
                    languge.languageDetail.getText().then(function (text) {
                        languageVariant.VariantValue = text.trim();
                        cb();
                    });
                }
            ], function () {
                languageVariantsArray.push(languageVariant);
                doneOneLanguage();
            });
        }, function () {
            obj[sectionName][sectionName] = languageVariantsArray;
            cb();
        });
    });
};