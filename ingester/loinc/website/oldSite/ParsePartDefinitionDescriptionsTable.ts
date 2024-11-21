import {By} from 'selenium-webdriver';

export async function parsePartDefinitionDescriptionsTable(driver, loincId, element) {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    let definitions = [];
    let definition: any = {};
    for (let tr of trs) {
        let trClass = await tr.getAttribute('class');
        if (trClass.indexOf('half_space') === -1) {
            let tds = await tr.findElements(By.xpath('td'));
            if (tds.length !== 2)
                throw new Error('Part definition error, source Td ' + loincId + ' td length !== 3');
            let tdStrongs = await tds[1].findElements(By.xpath('strong'));
            let tdSpans = await tds[1].findElements(By.xpath('span'));
            if (tdStrongs && tdStrongs.length > 0) {
                let tdStrongText = await tdStrongs[0].getText();
                if (tdStrongText.trim() === 'Part:') {
                    let partTd = tds[1];
                    let part = await partTd.findElement(By.xpath('a')).getText();
                    definition.part = part.trim();
                }
                if (tdStrongText.trim() === 'Copyright:') {
                    let copyrightTd = tds[1];
                    let copyright = await copyrightTd.getText();
                    definition.copyright = copyright.substr(tdStrongText.length, copyright.length).trim();
                }
            } else if (tdSpans && tdSpans.length > 0) {
            } else {
                let description = await tr.getText();
                definition.description = description.trim();
            }
        } else {
            definitions.push(definition);
            definition = {};
        }
    }
    return definitions;
}