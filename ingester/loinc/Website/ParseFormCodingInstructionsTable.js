const By = require('selenium-webdriver').By;

exports.parseFormCodingInstructionsTable = async (driver, loincId, element, cb) => {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    let FormCodingInstructionsText = await trs[0].getText();
    cb(FormCodingInstructionsText.trim());
};