const By = require('selenium-webdriver').By;

exports.parse3rdPartyCopyrightTable = async function (element, cb) {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    trs.pop();
    if (trs.length % 2 !== 0) throw new Error(obj.loincId + ' has odd 3rd party copyright');
    let thirdPartyCopyrightNotice = await trs[0].getText();
    thirdPartyCopyrightNotice = thirdPartyCopyrightNotice.trim() + '\n' + await trs[1].getText();
    cb(thirdPartyCopyrightNotice);

};