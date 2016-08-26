var async = require('async');
var By = require('selenium-webdriver').By;

exports.parseVersion = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    element.getText().then(function (text) {
        var versionText = text.trim();
        obj[sectionName][sectionName] = versionText;
        var versionNumStr = versionText.replace('Generated from LOINC version', '').trim();
        var versionNum = versionNumStr.substring(0, versionNumStr.length - 1);
        obj.version = versionNum;
        cb();
    })
};