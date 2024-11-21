import {By} from 'selenium-webdriver';

export async function parseRelatedNamesTable(driver, loincId, element) {
    let relatedNames = [];
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));
        tds.shift();
        for (let td of tds) {
            let text = await td.getText();
            let name = text.trim();
            if (name.length > 0) relatedNames.push(name);
        }
    }
    return relatedNames;
}