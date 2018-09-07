const By = require('selenium-webdriver').By;

let catcher = e => {
    console.log('Error parseCopyrightNotice');
    throw e;
};
exports.parseCopyrightNotice = async function (obj, task, element, cb) {
    let sectionName = task.sectionName;
    obj[sectionName] = {};
    let tds = await element.findElements(By.xpath('(tbody/tr)[2]/td')).catch(catcher);
    let td = tds[0];
    let a = await td.findElement(By.xpath('a')).catch(catcher);
    let text = await a.getText().catch(catcher);
    obj[sectionName].text = text.trim();
    let href = await a.getAttribute('href').catch(catcher);
    obj[sectionName].href = href;
    cb();
};