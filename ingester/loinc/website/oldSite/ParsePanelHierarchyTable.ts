import { By } from 'selenium-webdriver';
import { runOneLoinc } from 'ingester/loinc/website/oldSite/loincLoader';

export async function parsePanelHierarchyTable(driver, loincId, element) {
    const trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    trs.pop();

    let counter = 0;
    // Parse this form
    const currentLevels: any[] = [];
    let currentDepth = 0;
    for (const tr of trs) {
        const tds = await tr.findElements(By.xpath('td'));
        tds.shift();
        const row = await _parseOneRow(driver, tds);

        row.overrideDisplayNameText = await parseOverrideDisplayName(driver, counter);
        row.elements = [];
        const span = await tds[0].findElement(By.xpath('span'));
        const spanText = await span.getText();
        const a = await span.findElement(By.xpath('a'));
        const aText = await a.getText();
        const spaces = spanText.replace(aText, '');
        const depth = spaces.length / 5;
        if (depth > 0) {
            row.loinc = await runOneLoinc(row.loincId);
        }
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
    const xpath = '(//*[@class="Section1000000F00"])[' + (index + 1) + ']/table';
    const tables = await driver.findElements(By.xpath(xpath)).catch(e => {
        throw(e);
    });
    if (tables && tables[0]) {
        const trs = await tables[0].findElements(By.xpath('tbody/tr')).catch(e => {
            throw(e);
        });
        const tds = await trs[2].findElements(By.xpath('td')).catch(e => {
            throw(e);
        });
        const overrideDisplayNameText = await tds[2].getText().catch(e => {
            throw e;
        });
        return overrideDisplayNameText.trim();
    }
}

async function _parseOneRow(driver, tds) {
    const result: any = {};
    const loincIdText = await tds[0].getText().catch(e => {
        throw e;
    });
    result.loincId = loincIdText.trim();
    const loincNameText = await tds[1].getText().catch(e => {
        throw e;
    });
    result.loincName = loincNameText.trim();
    const rocText = await tds[2].getText().catch(e => {
        throw e;
    });
    result.roc = rocText.trim();
    const cardinalityText = await tds[3].getText().catch(e => {
        throw e;
    });
    result.cardinality = cardinalityText.trim();
    const exUcumUnitsText = await tds[4].getText().catch(e => {
        throw e;
    });
    result.exUcumUnitsText = exUcumUnitsText.trim();
    return result;
}
