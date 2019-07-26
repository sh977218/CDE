import { By } from 'selenium-webdriver';
import { sanitizeText } from '../../shared/utility';

export async function parseBasicAttributesTable(driver, loincId, element) {
    let result = {};
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));
        if (tds.length !== 3) {
            throw new Error('Parse basic attributes error ' + loincId);
        }
        let spaceTd = tds[0];
        let spaceClass = await spaceTd.getAttribute('class');
        if (spaceClass.trim().indexOf('spacer') === -1) {
            throw new Error('Parse basic attributes error ' + loincId);
        }
        let keyTd = tds[1];
        let keyText = await keyTd.getText();
        let key = sanitizeText(keyText.trim());
        let valueTd = tds[2];
        let valueText = await valueTd.getText();
        result[key] = valueText.trim();
    }
    return result;
}