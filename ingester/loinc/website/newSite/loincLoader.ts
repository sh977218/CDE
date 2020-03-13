import { Builder, By } from 'selenium-webdriver';
import { findIndex, isEqual, sortBy, words } from 'lodash';
import { tasks } from 'ingester/loinc/website/newSite/loincSectionParser';

require('chromedriver');

export async function loadLoincById(loincId) {
    const driver = await new Builder().forBrowser('chrome').build();
    const url = `https://loinc.org/${loincId.trim()}/`;
    await driver.get(url);
    console.log(url);
    const sectionElementsOnPage = await driver.findElements(By.xpath('//section/h2'));
    const loinc = {url};
    const sortTask = sortBy(tasks, ['sectionName']);
    for (const task of sortTask) {
        const sectionName = task.sectionName;
        const elements = await driver.findElements(By.xpath(task.xpath));
        const elementsLength = elements.length;
        if (elementsLength === 1) {
            loinc[sectionName] = await task.function(elements[0]);
        }
    }
    const allKeys = Object.keys(loinc);
    for (const sectionElementOnPage of sectionElementsOnPage) {
        const sectionNameOnPage = await sectionElementOnPage.getText();
        const foundKey = findIndex(allKeys, k => isEqual(words(k).join(''), words(sectionNameOnPage.trim()).join('')));
        if (!foundKey) {
            console.log(`${loincId} Selection ${sectionNameOnPage} exists on page. but didn't get parsed.`);
            process.exit(1);
        }
    }


    await driver.close();
    return loinc;
}
