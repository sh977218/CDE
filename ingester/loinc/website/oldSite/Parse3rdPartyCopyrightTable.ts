import { By } from 'selenium-webdriver';

export async function parse3rdPartyCopyrightTable(driver, loincId, element) {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    trs.pop();
    if (trs.length % 2 !== 0) {
        console.log(loincId + ' has odd 3rd party copyright ' + loincId);
        process.exit(1);
    }
    let thirdPartyCopyrightNotice = await trs[0].getText();
    thirdPartyCopyrightNotice = thirdPartyCopyrightNotice.trim() + '\n' + await trs[1].getText();
    return thirdPartyCopyrightNotice;
};