const By = require('selenium-webdriver').By;
const utility = require('../Utility/utility');

exports.parseBasicAttributesTable = async (driver, loincId, element, cb) => {
    let result = {};
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));
        if (tds.length !== 3)
            throw new Error('Parse basic attributes error ' + loincId);
        let spaceTd = tds[0];
        let spaceClass = await spaceTd.getAttribute('class');
        if (spaceClass.trim().indexOf('spacer') === -1) throw new Error('Parse basic attributes error ' + loincId);

        let keyTd = tds[1];
        let keyText = await keyTd.getText();
        let key = utility.sanitizeText(keyText.trim());
        let valueTd = tds[2];
        let valueText = await valueTd.getText();
        let value = valueText.trim();
        result[key] = value;
    }
    cb(result);
};