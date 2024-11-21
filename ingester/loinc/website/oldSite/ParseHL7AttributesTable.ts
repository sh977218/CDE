import {By} from 'selenium-webdriver';
import {sanitizeText} from 'ingester/shared/utility';

export async function parseHL7AttributesTable(driver, loincId, element) {
    let basicAttributes = {};
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));
        if (tds.length !== 3)
            throw new Error('Parse HL7 attributes error ' + loincId);
        let spaceTd = tds[0];
        let spaceClass = await spaceTd.getAttribute('class');
        if (spaceClass.trim().indexOf('spacer') === -1) throw new Error('Parse HL7 attributes error ' + loincId);
        let keyTd = tds[1];
        let key = await keyTd.getText();
        let valueTd = tds[2];
        let value = await valueTd.getText();
        basicAttributes[sanitizeText(key.trim())] = sanitizeText(value.trim());
    }
    return basicAttributes;
}