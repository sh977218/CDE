import { By } from 'selenium-webdriver';

export function parseShortname(element) {
    return new Promise(async (resolve, reject) => {
        let tds = await element.findElements(By.xpath('td'));
        if (tds.length !== 3) reject('Shortname');
        let text = await tds[1].getText();
        if (text.trim().indexOf('Shortname:') === -1) reject('Shortname error');
        let result = await tds[2].getText();
        resolve(result.trim());
    })
}