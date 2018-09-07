const By = require('selenium-webdriver').By;

let catcher = e => {
    console.log('Error parse3rdPartyCopyrightTable');
    throw e;
};
exports.parse3rdPartyCopyrightTable = async function (obj, task, element, cb) {
    let sectionName = task.sectionName;
    obj[sectionName] = {};
    let trs = await element.findElements(By.xpath('tbody/tr')).catch(catcher);

    trs.shift();
    trs.pop();

    if (trs.length % 2 !== 0) {
        consolog(obj.loincId + ' has odd 3rd party copyright');
        process.exit(1);
    }
    obj[sectionName].codeSystem = await trs[0].getText().catch(catcher);
    obj[sectionName].text = await trs[1].getText().catch(catcher);
    cb();
};