import { By } from 'selenium-webdriver';
import { loadLoincById } from 'ingester/loinc/website/newSite/loincLoader';

export async function parseStandards(element) {
    const standards: any[] = [];
    const trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (const tr of trs) {
        const standard: any = {};
        const tds = await tr.findElements(By.xpath('td'));
        const standardString = await tds[0].getText();
        standard.Standard = standardString.trim();

        const nameString = await tds[1].getText();
        standard.Name = nameString.trim();

        const idString = await tds[2].getText();
        standard.ID = idString.trim();

        const sourceString = await tds[3].getText();
        standard.Source = sourceString.trim();

        if (standard.Source === 'LOINC') {
            standard.loinc = await loadLoincById(standard.ID);
        }

        standards.push(standard);
    }
    return standards;
}
