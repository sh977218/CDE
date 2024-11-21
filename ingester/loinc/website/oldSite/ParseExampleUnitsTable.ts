import {By} from 'selenium-webdriver';

export async function parseExampleUnitsTable(driver, loincId, element) {
    let exampleUnits = [];
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    trs.shift();
    for (let tr of trs) {
        let exampleUnit: any = {};
        let tds = await tr.findElements(By.xpath('td'));
        let unitText = await tds[1].getText();
        exampleUnit.Unit = unitText.trim();
        let sourceTypeText = await tds[2].getText();
        exampleUnit['Source Type'] = sourceTypeText.trim();
        exampleUnits.push(exampleUnit);
    }
    return exampleUnits;
}