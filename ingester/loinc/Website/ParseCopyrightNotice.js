const By = require('selenium-webdriver').By;

exports.parseCopyrightNotice = async function (driver, loincId, table, cb) {
    let result = await table.findElement(By.xpath('(tbody/tr)[2]/td')).getText();
    cb(result.trim());
};