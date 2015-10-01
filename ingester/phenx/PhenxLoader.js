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

driver.get(baseUrl);
var td1 = driver.findElements(By.xpath("//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td[1]/div/div")).length;
var td2 = driver.findElements(By.xpath("//*[@id='phenxTooltip']//following-sibling::table/tbody/tr/td[2]/div/div")).length;

console.log('ho');
/*
 mongo_form.byId(form, function (err, existingForm) {
 if (err) throw err;

 });
 */
