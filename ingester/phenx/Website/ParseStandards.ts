import { By } from 'selenium-webdriver';
import { runOneLoinc } from '../../loinc/website/LOINCLoader';

export async function parseStandards(element) {
    let standards = [];
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let standard: any = {};
        let tds = await tr.findElements(By.xpath('td'));
        let standardString = await tds[0].getText();
        standard['Standard'] = standardString.trim();

        let nameString = await tds[1].getText();
        standard['Name'] = nameString.trim();

        let idString = await tds[2].getText();
        standard['ID'] = idString.trim();

        let sourceString = await tds[3].getText();
        standard['Source'] = sourceString.trim();

        if (standard['Source'] === 'LOINC')
            standard.loinc = await runOneLoinc(standard.ID);

        standards.push(standard);
    }
    return standards;
}