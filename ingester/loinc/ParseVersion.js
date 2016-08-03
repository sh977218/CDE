var async = require('async');
var By = require('selenium-webdriver').By;

exports.parseVersion = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    var version;
    element.getText().then(function (text) {
        version = text.trim();
        obj[sectionName][sectionName] = version;
        cb();
    })
};