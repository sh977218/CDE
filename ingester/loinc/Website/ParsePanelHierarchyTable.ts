import { By } from 'selenium-webdriver';
import { runOneLoinc } from 'ingester/loinc/Website/loincLoader';

export async function parsePanelHierarchyTable(driver, loincId, element) {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    trs.pop();

    let counter = 0;
    // Parse this form
    let currentLevels = [];
    let currentDepth = 0;
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));
        tds.shift();
        let row = await _parseOneRow(driver, tds);

        row.overrideDisplayNameText = await parseOverrideDisplayName(driver, counter);
        row.elements = [];
        let span = await tds[0].findElement(By.xpath('span'));
        let spanText = await span.getText();
        let a = await span.findElement(By.xpath('a'));
        let aText = await a.getText();
        let spaces = spanText.replace(aText, '');
        let depth = spaces.length / 5;
        if (depth > 0) row.loinc = await runOneLoinc(row.loincId);
        if (depth === 0) {
            currentLevels[0] = row;
            currentDepth = 0;
        } else if (depth > currentDepth) {
            currentLevels[currentDepth].elements.push(row);
            currentLevels[depth] = row;
            currentDepth = depth;
        } else if (depth === currentDepth) {
            currentLevels[depth - 1].elements.push(row);
            currentLevels[depth] = row;
        } else if (depth < currentDepth) {
            currentLevels[currentDepth] = null;
            currentLevels[depth] = row;
            currentLevels[depth - 1].elements.push(row);
            currentDepth = depth;
        }
        counter++;
    }
    return currentLevels[0];
}

async function parseOverrideDisplayName(driver, index) {
    let xpath = '(//*[@class="Section1000000F00"])[' + (index + 1) + ']/table';
    let tables = await driver.findElements(By.xpath(xpath)).catch(e => {
        throw(e);
    });
    if (tables && tables[0]) {
        let trs = await tables[0].findElements(By.xpath('tbody/tr')).catch(e => {
            throw(e);
        });
        let tds = await trs[2].findElements(By.xpath('td')).catch(e => {
            throw(e);
        });
        let overrideDisplayNameText = await tds[2].getText().catch(e => {
            throw e;
        });
        return overrideDisplayNameText.trim();
    }
}

async function _parseOneRow(driver, tds) {
    let result: any = {};
    let loincIdText = await tds[0].getText().catch(e => {
        throw e;
    });
    result.loincId = loincIdText.trim();
    let LoincNameText = await tds[1].getText().catch(e => {
        throw e;
    });
    result.loincName = LoincNameText.trim();
    let rocText = await tds[2].getText().catch(e => {
        throw e;
    });
    result.roc = rocText.trim();
    let cardinalityText = await tds[3].getText().catch(e => {
        throw e;
    });
    result.cardinality = cardinalityText.trim();
    let exUcumUnitsText = await tds[4].getText().catch(e => {
        throw e;
    });
    result.exUcumUnitsText = exUcumUnitsText.trim();
    return result;
}