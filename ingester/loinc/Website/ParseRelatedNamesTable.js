const By = require('selenium-webdriver').By;

exports.parseRelatedNamesTable = async function (element, cb) {
    let relatedNames = [];
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));
        tds.shift();
        for (let td of tds) {
            let text = await td.getText();
            let name = text.trim();
            if (name.length > 0) relatedNames.push(name);
        }
    }
    cb(relatedNames);
};