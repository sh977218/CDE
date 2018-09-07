var async = require('async');
var By = require('selenium-webdriver').By;


exports.checkLformViewer = function (driver, obj, cb) {
    driver.findElements(By.xpath('html/body/div[@class="Section1"]/table[.//th[contains(text(),"PANEL HIERARCHY")]]//a')).then(function (links) {
        if (links.length === 0) {
            obj.dependentSection = true;
            cb();
        } else if (links.length === 1) {
            var link = links[0];
            link.getText().then(function (text) {
                if (text.trim() === 'view this panel in the LForms viewer') {
                    obj.dependentSection = false;
                    cb();
                }
            })
        } else {
            console.log('Lform viewer link has two xpath found. ' + JSON.stringify(obj));
            process.exit(1);
        }
    })
};