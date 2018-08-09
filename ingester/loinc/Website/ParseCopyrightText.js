var async = require('async');
var By = require('selenium-webdriver').By;

exports.parseCopyrightText = function (obj, task, element, cb) {
    var sectionName = task.sectionName;
    var copyright = '';
    element.getText().then(function (text) {
        copyright = text.trim();
        obj[sectionName][sectionName] = copyright;
        cb();
    })
};