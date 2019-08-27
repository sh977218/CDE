import { By } from 'selenium-webdriver';
import { parseFullySpecifiedName } from './ParseFullySpecifiedName';
import { parseLongCommonName } from './ParseLongCommonName';
import { parseShortname } from './ParseShortname';

export async function parseNameTable(driver, loincId, table) {
    let result = {};
    let trs = await table.findElements(By.xpath('tbody/tr'));
    trs.shift();

    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));
        let td2Text = await tds[1].getText();
        if (td2Text.trim() === 'Fully-Specified Name:') {
            // Parse Fully-Specified Name
            let fullSpecifiedName = await parseFullySpecifiedName(tr);
            result['Fully-Specified Name'] = fullSpecifiedName;
        }
        if (td2Text.trim() === 'Long Common Name:') {
            // Parse Long Common Name
            let longCommonName = await parseLongCommonName(tr);
            result['Long Common Name'] = longCommonName;
        }
        if (td2Text.trim() === 'Shortname:') {
            // Parse Shortname
            result['Shortname'] = await parseShortname(tr);
        }
    }
    return result;
}