const By = require('selenium-webdriver').By;
const utility = require('../Utility/utility');

exports.parseHL7AttributesTable = async function (element, cb) {
    let basicAttributes = {};
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));
        if (tds.length !== 3) throw new Error('Parse HL7 attributes error.');
        let spaceTd = tds[0];
        let spaceClass = await spaceTd.getAttribute('class');
        if (spaceClass.trim().indexOf('spacer') === -1) throw new Error('Parse HL7 attributes error.');
        let keyTd = tds[1];
        let key = await keyTd.getText();
        let valueTd = tds[2];
        let value = await valueTd.getText();
        basicAttributes[utility.sanitizeText(key.trim())] = utility.sanitizeText(value.trim());
    }
    cb(basicAttributes);
};