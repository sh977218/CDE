import { By } from 'selenium-webdriver';

export function parseFullySpecifiedName(element) {
    return new Promise(async (resolve, reject) => {
        const result = {};
        const tds = await element.findElements(By.xpath('td'));
        if (tds.length !== 3) {
            reject('fully specified name error');
        }
        const text = await tds[1].getText();
        if (text.trim().indexOf('Fully-Specified Name:') === -1) {
            reject('fully specified name error');
        }
        const table = await tds[2].findElement(By.xpath('table'));
        if (!table) {
            reject('fully specified name error');
        }
        const trs = await table.findElements(By.xpath('tbody/tr'));
        if (trs.length !== 2) {
            reject('fully specified name error');
        }

        const keyThs = await trs[0].findElements(By.xpath('th'));
        const valueTds = await trs[1].findElements(By.xpath('td'));
        for (let i = 0; i < keyThs.length; i++) {
            const th = keyThs[i];
            const td = valueTds[i];
            const key = await th.getText();
            const value = await td.getText();
            result[key.trim()] = value.trim();
        }
        resolve(result);
    });
}
