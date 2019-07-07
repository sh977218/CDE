import { By } from 'selenium-webdriver';

export async function parseCopyrightNotice(driver, loincId, table, cb) {
    let result = await table.findElement(By.xpath('(tbody/tr)[2]/td')).getText();
    cb(result.trim());
}