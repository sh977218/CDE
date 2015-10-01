var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until,
    fs = require('fs'),
    mongoose = require('mongoose'),
    config = require('config'),
    mongo_cde = require('../../modules/cde/node-js/mongo-cde'),
    mongo_form = require('../../modules/form/node-js/mongo-form'),
    classificationShared = require('../../modules/system/shared/classificationShared.js'),
    async = require('async'),
    crypto = require('crypto');

// global variables
var baseUrl = "https://www.phenxtoolkit.org/index.php?pageLink=browse.measures&tree=off";
var user = {username: "batchloader"};
var driver = new webdriver.Builder().forBrowser('firefox').build();
var allMeasures = [];
driver.get(baseUrl);
var xpaths = ["//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td[1]/div/div", "//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td[2]/div/div"];
var counter = 0;
async.eachSeries(xpaths, function (xpath, doneAllXpaths) {
        driver.findElements(webdriver.By.xpath(xpath)).then(function (links) {
            var measures = {};
            links.forEach(function (link) {
                link.findElement(webdriver.By.tagName('a')).then(function (hrefs) {
                    hrefs[0].getText().then(function (text) {
                        measures['addText'] = text;
                    });
                    hrefs[0].getAttrib('href').then(function (text) {
                        measures['addLink'] = text;
                    });
                    hrefs[1].getText().then(function (text) {
                        measures['text'] = text;
                    });
                    hrefs[1].getAttrib('href').then(function (text) {
                        measures['link'] = text;
                    });
                    console.log('ha');
                })
            });
        });
    }, function doneAllXpaths() {
        console.log('finished all measures');
    }
);
/*
 mongo_form.byId(form, function (err, existingForm) {
 if (err) throw err;

 });
 */
