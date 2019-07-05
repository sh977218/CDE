const By = require('selenium-webdriver').By;

exports.parseLoincIdTable = async (driver, loincId, element, cb) => {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    let tds = await trs[0].findElements(By.xpath('td'));
    let loincIdText = await tds[0].getText();
    cb(loincIdText.trim());
};