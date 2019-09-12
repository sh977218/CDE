import { By } from 'selenium-webdriver';
import { sanitizeText } from '../../shared/utility';

export async function parseBasicAttributesTable(driver, loincId, element) {
    if (loincId === '56094-6') {
        console.log('a');
    }
    const result = {};
    const trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (const tr of trs) {
        const tds = await tr.findElements(By.xpath('td'));
        if (tds.length !== 3) {
            throw new Error('Parse basic attributes error ' + loincId);
        }
        const spaceTd = tds[0];
        const spaceClass = await spaceTd.getAttribute('class');
        if (spaceClass.trim().indexOf('spacer') === -1) {
            throw new Error('Parse basic attributes error ' + loincId);
        }
        const keyTd = tds[1];
        const keyText = await keyTd.getText();
        const key = sanitizeText(keyText.trim());
        const valueTd = tds[2];
        const valueText = await valueTd.getText();
        result[key] = valueText.trim();
    }
    return result;
}
