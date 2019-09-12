import { By } from 'selenium-webdriver';
import { sanitizeText } from '../../shared/utility';

export async function parseSubmittersInformationTable(driver, loincId, element) {
    let basicAttributesObj = {};
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));

        let keyText = await tds[1].getText();
        let valueText = await tds[2].getText();
        let key = sanitizeText(keyText.trim());
        basicAttributesObj[key.trim()] = valueText.trim();
    }
    return basicAttributesObj;
}