import {By} from 'selenium-webdriver';
import {sanitizeText} from 'ingester/shared/utility';

export async function parseCopyrightTable(driver, loincId, element) {
    let copyright = {};
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));

        let key = await tds[1].getText();
        let value = await tds[2].getText();
        copyright[sanitizeText(key.trim())] = value.trim();
    }
    return copyright;
}