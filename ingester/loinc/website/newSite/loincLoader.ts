import { Builder, By } from 'selenium-webdriver';
import { isEmpty, sortBy } from 'lodash';
import { tasks } from 'ingester/loinc/website/newSite/loincSectionParser';

require('chromedriver');

export async function loadLoincById(loincId) {
    const driver = await new Builder().forBrowser('chrome').build();
    const url = `https://loinc.org/${loincId.trim()}/`;
    await driver.get(url);
    console.log(url);
    const allSections = await driver.findElements(By.xpath('//section'));
    if (allSections.length > tasks.length) {
        console.log(`${loincId} has some missing sections`);
        process.exit(1);
    }
    const loinc = {url};
    const sortTask = sortBy(tasks, ['sectionName']);
    for (const task of sortTask) {
        const sectionName = task.sectionName;
        const elements = await driver.findElements(By.xpath(task.xpath));
        const elementsLength = elements.length;
        if (elementsLength === 0) {
            console.log(`${loincId} doesn't have Selection ${sectionName}.`);
        } else if (elementsLength > 1) {
            console.log(`${loincId} multiple Selection ${sectionName} found.`);
            process.exit(1);
        } else {
            loinc[sectionName] = await task.function(elements[0]);
            if (isEmpty(loinc[sectionName])) {
                console.log(`${loincId} Selection ${sectionName} exists on page. but didn't get parsed.`);
                process.exit(1);
            }
        }
    }
    driver.close();
    return loinc;
}
