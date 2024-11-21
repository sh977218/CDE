import {By} from 'selenium-webdriver';
import {parseFullySpecifiedName} from './ParseFullySpecifiedName';
import {parseLongCommonName} from './ParseLongCommonName';
import {parseShortname} from './ParseShortname';

export async function parseNameTable(driver, loincId, table) {
    const result: any = {};
    const trs = await table.findElements(By.xpath('tbody/tr'));
    trs.shift();

    for (const tr of trs) {
        const tds = await tr.findElements(By.xpath('td'));
        const td2Text = await tds[1].getText();
        if (td2Text.trim() === 'Fully-Specified Name:') {
            // Parse Fully-Specified Name
            const fullSpecifiedName = await parseFullySpecifiedName(tr);
            result['Fully-Specified Name'] = fullSpecifiedName;
        }
        if (td2Text.trim() === 'Long Common Name:') {
            // Parse Long Common Name
            const longCommonName = await parseLongCommonName(tr);
            result['Long Common Name'] = longCommonName;
        }
        if (td2Text.trim() === 'Shortname:') {
            // Parse Shortname
            result.Shortname = await parseShortname(tr);
        }
    }

    return result;
}
