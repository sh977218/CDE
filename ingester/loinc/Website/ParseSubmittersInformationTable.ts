const By = require('selenium-webdriver').By;

const utility = require('../Utility/utility');

exports.parseSubmittersInformationTable = async function (driver, loincId, element, cb) {
    let basicAttributesObj = {};
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));

        let keyText = await tds[1].getText();
        let valueText = await tds[2].getText();
        let key = utility.sanitizeText(keyText.trim());
        let value = valueText.trim();
        basicAttributesObj[key.trim()] = value;
    }
    cb(basicAttributesObj);
};