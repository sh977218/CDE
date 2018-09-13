const By = require('selenium-webdriver').By;

const utility = require('../Utility/utility');

exports.parseCopyrightTable = async function (element, cb) {
    let result = {};
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));

        let key = await tds[1].getText();
        let value = await tds[2].getText();
        result[utility.sanitizeText(key.trim())] = value.trim();
    }
    cb(result);
};