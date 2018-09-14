const By = require('selenium-webdriver').By;

exports.parseLoincIdTable = async (element, cb) => {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    let tds = await trs[0].findElements(By.xpath('td'));
    let loincIdText = await tds[0].getText();
    let loincId = loincIdText.trim();
    cb(loincId);
};