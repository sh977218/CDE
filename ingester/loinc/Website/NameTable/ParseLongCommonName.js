const By = require('selenium-webdriver').By;

exports.parseLongCommonName = function (element) {
    return new Promise(async (resolve, reject) => {
        let tds = await element.findElements(By.xpath('td'));
        if (tds.length !== 3) reject('long common name error');
        let text = await tds[1].getText();
        if (text.trim().indexOf('Long Common Name:') === -1) reject('long common name error');
        let result = await tds[2].getText();
        resolve(result.trim());
    })
};