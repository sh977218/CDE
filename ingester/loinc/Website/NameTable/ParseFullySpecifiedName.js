const By = require('selenium-webdriver').By;

exports.parseFullySpecifiedName = function (element) {
    return new Promise(async (resolve, reject) => {
        let result = {};
        let tds = await element.findElements(By.xpath('td'));
        if (tds.length !== 3) reject('fully specified name error');
        let text = await tds[1].getText();
        if (text.trim().indexOf('Fully-Specified Name:') === -1) reject('fully specified name error');
        let table = await tds[2].findElement(By.xpath('table'));
        if (!table) reject('fully specified name error');
        let trs = await table.findElements(By.xpath('tbody/tr'));
        if (trs.length !== 2) reject('fully specified name error');

        let keyThs = await trs[0].findElements(By.xpath('th'));
        let valueTds = await trs[1].findElements(By.xpath('td'));
        for (let i = 0; i < keyThs.length; i++) {
            let th = keyThs[i];
            let td = valueTds[i];
            let key = await th.getText();
            let value = await td.getText();
            result[key.trim()] = value.trim();
        }
        resolve(result);
    })
};