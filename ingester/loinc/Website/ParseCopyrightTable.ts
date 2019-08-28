import { By } from 'selenium-webdriver';
import { sanitizeText } from '../Utility/utility';

export async function parseCopyrightTable(driver, loincId, element) {
    let result = {};
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));

        let key = await tds[1].getText();
        let value = await tds[2].getText();
        result[sanitizeText(key.trim())] = value.trim();
    }
    return result;
}