var webdriver = require('selenium-webdriver');
var driver = new webdriver.Builder().forBrowser('chrome').build();

exports.parseOneMeasure = function (measure, cb) {
    driver.get(measure.href);
};