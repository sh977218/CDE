import {By} from 'selenium-webdriver';
import {sanitizeText} from 'ingester/shared/utility';

export async function parseSubmittersInformationTable(driver, loincId, element) {
    const basicAttributesObj = {};
    const trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (const tr of trs) {
        const tds = await tr.findElements(By.xpath('td'));

        const keyText = await tds[1].getText();
        const valueText = await tds[2].getText();
        const key = sanitizeText(keyText.trim());
        basicAttributesObj[key.trim()] = valueText.trim();
    }
    return basicAttributesObj;
}
