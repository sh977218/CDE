import {By} from 'selenium-webdriver';

export async function parseFormCodingInstructionsTable(driver, loincId, element) {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    let FormCodingInstructionsText = await trs[0].getText();
    return FormCodingInstructionsText.trim();
}