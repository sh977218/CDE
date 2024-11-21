import {By} from 'selenium-webdriver';

export async function parseLoincNameTable(driver, loincId, element) {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    let tds = await trs[0].findElements(By.xpath('td'));
    let loincNameText = await tds[1].getText();
    let loincName = loincNameText.trim();
    return loincName;
}