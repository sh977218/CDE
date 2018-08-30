let async = require('async'),
    webdriver = require('selenium-webdriver'),
    by = webdriver.By,
    until = webdriver.until;

const TOTAL_PAGE = 31;
const TOTAL_RECORD = 3037;
const URL = "https://commondataelements.ninds.nih.gov/CRF.aspx";

function textPresent(by, text) {
    driver.wait(until.elementLocated(by), 10000, text);
}

let driver = new webdriver.Builder().forBrowser('chrome').build();
driver.get(URL);
driver.findElement(by.id("ContentPlaceHolder1_btnClear")).click();
textPresent(by.css("body"), "Page: 1 of 1");
driver.findElement(by.id("ddlPageSize")).click();
driver.findElement(by.id("ddlPageSize")).findElements(by.tagName("option")).then(function (options) {
    options[0].getText().then(function (text) {
        console.log(text);
    });
});

