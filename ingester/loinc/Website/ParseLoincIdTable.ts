import { By } from 'selenium-webdriver';

export async function parseLoincIdTable(driver, loincId, element) {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    let tds = await trs[0].findElements(By.xpath('td'));
    let loincIdText = await tds[0].getText();
    return loincIdText.trim();
}