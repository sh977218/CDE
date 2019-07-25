import { By } from 'selenium-webdriver';

export async function parse3rdPartyCopyrightTable(driver, loincId, element, cb) {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    trs.pop();
    if (trs.length % 2 !== 0)
        throw new Error(loincId + ' has odd 3rd party copyright ' + loincId);
    let thirdPartyCopyrightNotice = await trs[0].getText();
    thirdPartyCopyrightNotice = thirdPartyCopyrightNotice.trim() + '\n' + await trs[1].getText();
    cb(thirdPartyCopyrightNotice);

};