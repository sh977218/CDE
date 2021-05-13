import { Builder, By } from 'selenium-webdriver';
import { parseDl } from 'ingester/loinc/website/newSite/loincSectionParser';

async function selectionWithDl(htmlElement) {
    const dlElements = await htmlElement.findElements(By.xpath('./dl'));
    if (dlElements.length !== 1) {
        console.log(`Basic Attributes has wrong dl`);
        process.exit(1);
    } else {
        const result = await parseDl(dlElements[0]);
        return result;
    }
}

const tasks = [
    {
        sectionName: 'Basic Attributes',
        function: selectionWithDl,
        xpath: "//*[@id='basic-attributes']"
    },
];

export async function loadLoincPartById(partId) {
    let partDescription: any = {partId};
    const driver = await new Builder().forBrowser('chrome').build();
    let pageError = false;
    await driver.get(`https://loinc.org/${partId}/`).catch(e => {
        console.log(`Page about ${partId} is not found. e: ${e}`);
        pageError = true;
    });

    const pageNotFoundElements = await driver.findElements(By.xpath("//*[text() = 'Page Not Found' or text() = 'No details available']"))

    if (pageError || pageNotFoundElements.length) {
        partDescription = {};
    } else {
        for (const task of tasks) {
            const sectionName = task.sectionName;
            const elements = await driver.findElements(By.xpath(task.xpath));
            partDescription[sectionName] = await task.function(elements[0]);
        }
    }
    await driver.close();
    return partDescription;

}
