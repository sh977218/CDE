const By = require('selenium-webdriver').By;

exports.parseLoincNameTable = async (driver, loincId, element, cb) => {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    let tds = await trs[0].findElements(By.xpath('td'));
    let loincNameText = await tds[1].getText();
    let loincName = loincNameText.trim();
    cb(loincName);

};