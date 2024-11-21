import {By} from 'selenium-webdriver';

export async function parseLongCommonName(element) {
    let tds = await element.findElements(By.xpath('td'));
    if (tds.length !== 3) {
        throw 'long common name error, length !== 3';
    }
    let text = await tds[1].getText();
    if (text.trim().indexOf('Long Common Name:') === -1) {
        throw 'long common name error';
    }
    let result = await tds[2].getText();
    return result.trim();
}