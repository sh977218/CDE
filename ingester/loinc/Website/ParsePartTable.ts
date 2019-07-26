import { By } from 'selenium-webdriver';

export async function parsePartTable(driver, loincId, element) {
    let parts = [];
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let part = {};
        let tds = await tr.findElements(By.xpath('td'));
        let text0 = await tds[0].getAttribute('innerHTML');
        part['Part Type'] = text0.replace(/&nbsp;/g, '').trim();
        let a = await tds[2].findElement(By.css('a'));
        let aText = await a.getAttribute('innerHTML');
        part['Part No'] = aText.trim();
        let urlText = await a.getAttribute('href');
        part['Part No Link'] = urlText.trim();
        let text3 = await tds[3].getAttribute('innerHTML');
        part['Part Name'] = text3.replace(/&nbsp;/g, '').trim();
        parts.push(part);
    }
    return parts;
}