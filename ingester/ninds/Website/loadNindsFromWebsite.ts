import { Builder, By, until } from 'selenium-webdriver';
import { replace } from 'lodash';
import { NindsModel } from 'ingester/createMigrationConnection';

require('chromedriver');

const URL_PREFIX = 'https://www.commondataelements.ninds.nih.gov/';

// tslint:disable-next-line:max-line-length
// document count xpath: //div[div[p[button[normalize-space(text())='Expand All']]]]/div[@class='view-content']/div[@class='view-grouping']/div[@class='view-grouping-content']/div/table/tbody/tr
const DISORDERS: any = [
    {
        disorderName: 'General (For all diseases)',
        url: URL_PREFIX + 'General%20%28For%20all%20diseases%29',
    }, {
        disorderName: 'Amyotrophic Lateral Sclerosis',
        url: URL_PREFIX + 'amyotrophic%20lateral%20sclerosis',
    }, {
        disorderName: 'Cerebral Palsy',
        url: URL_PREFIX + 'cerebral%20palsy',
    }, {
        disorderName: 'Chiari I Malformation',
        url: URL_PREFIX + 'Chiari%20I%20Malformation',
    }, {
        disorderName: 'Epilepsy',
        url: URL_PREFIX + 'epilepsy',
    }, {
        disorderName: "Friedreich's Ataxia",
        url: URL_PREFIX + 'Friedreich%27s%20Ataxia',
    }, {
        disorderName: 'Headache',
        url: URL_PREFIX + 'headache',
    }, {
        disorderName: 'Huntington’s Disease',
        url: URL_PREFIX + 'Huntington%27s%20Disease',
    }, {
        disorderName: 'Mitochondrial Disease',
        url: URL_PREFIX + 'Mitochondrial%20Disease',
    }, {
        disorderName: 'Multiple Sclerosis',
        url: URL_PREFIX + 'Multiple%20Sclerosis',
    }, {
        disorderName: 'Myalgic Encephalomyelitis/Chronic Fatigue Syndrome',
        url: URL_PREFIX + 'Myalgic%20Encephalomyelitis/Chronic%20Fatigue%20Syndrome',
    }, {
        disorderName: 'Neuromuscular Diseases',
        url: URL_PREFIX + 'Myalgic%20Encephalomyelitis/Chronic%20Fatigue%20Syndrome',
    }, {
        disorderName: 'Congenital Muscular Dystrophy',
        url: URL_PREFIX + 'Congenital%20Muscular%20Dystrophy',
    }, {
        disorderName: 'Duchenne/Becker Muscular Dystrophy',
        url: URL_PREFIX + 'Duchenne%20Muscular%20Dystrophy/Becker%20Muscular%20Dystrophy',
    }, {
        disorderName: 'Facioscapulohumeral muscular dystrophy (FSHD)',
        url: URL_PREFIX + 'Facioscapulohumeral%20Muscular%20Dystrophy',
    }, {
        disorderName: 'Myasthenia Gravis',
        url: URL_PREFIX + 'Myasthenia%20Gravis',
    }, {
        disorderName: 'Myotonic Dystrophy',
        url: URL_PREFIX + 'Myotonic%20Muscular%20Dystrophy',
    }, {
        disorderName: 'Spinal Muscular Atrophy',
        url: URL_PREFIX + 'Spinal%20Muscular%20Atrophy',
    }, {
        disorderName: "Parkinson's Disease",
        url: URL_PREFIX + 'Parkinson%27s%20Disease',
    }, {
        disorderName: 'Spinal Cord Injury',
        url: URL_PREFIX + 'Spinal%20Cord%20Injury',
    }, {
        disorderName: 'Stroke',
        url: URL_PREFIX + 'Stroke',
    }, {
        disorderName: 'Unruptured Cerebral Aneurysms and Subarachnoid Hemorrhage',
        url: URL_PREFIX + 'Unruptured%20Cerebral%20Aneurysms%20and%20Subarachnoid%20Hemorrhage',
    }, {
        disorderName: 'Traumatic Brain Injury',
        url: URL_PREFIX + 'Traumatic%20Brain%20Injury',
        subDiseases: [{
            name: 'Acute Hospitalized',
        }, {
            name: 'Comprehensive',
        }, {
            name: 'Concussion/Mild TBI',
        }, {
            name: 'Epidemiology',
        }, {
            name: 'Moderate/Severe TBI: Rehabilitation',
        }]
    }, {
        disorderName: 'Sport-Related Concussion',
        url: URL_PREFIX + 'Sport%20Related%20Concussion',
        subDiseases: [{
            name: 'Acute',
        }, {
            name: 'Comprehensive',
        }, {
            name: 'Persistent/Chronic',
        }, {
            name: 'Subacute',
        }]
    }
];

async function doCdesHeader(ninds: any, headerDiv: any) {
    let diseaseName = '';
    let subDomainName = '';
    let crfName = '';
    const fullText = await headerDiv.getText();
    const elements = await headerDiv.findElements(By.xpath('./*'));
    for (const element of elements) {
        const text = await element.getText();
        const diseaseIndex = text.indexOf('Disease: ');
        if (diseaseIndex !== -1) {
            diseaseName = replace(text, 'Disease: ', '');
        }
        const subDomainIndex = text.indexOf('Sub-Domain: ');
        if (subDomainIndex !== -1) {
            subDomainName = replace(text, 'Sub-Domain: ', '');
        }
        const crfIndex = text.indexOf('CRF: ');
        if (crfIndex !== -1) {
            crfName = replace(text, 'CRF: ', '');
        }
    }
    ninds.diseaseName = diseaseName;
    ninds.subDomainName = subDomainName;
    ninds.crfName = crfName;
    ninds.fullText = fullText;
}

async function doCdesTable(ninds: any, cdeTableElement: any) {
    ninds.cdes = [];
    const keys = [];
    const ths = await cdeTableElement.findElements(By.xpath('./thead/tr/th'));
    for (const th of ths) {
        const key = await th.getText();
        const keyReplace = key.replace('(e.g., Core)', '');
        keys.push(keyReplace.trim());
    }
    const trs = await cdeTableElement.findElements(By.xpath('./tbody/tr'));
    for (const tr of trs) {
        const cde: any = {};
        const tds = await tr.findElements(By.xpath('./td'));

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < tds.length; i++) {
            const td = tds[i];
            const value = await td.getText();
            cde[keys[i]] = value.trim();
        }
        ninds.cdes.push(cde);
    }
}

async function doCdes(ninds: any, url: string) {
    const driver = await new Builder().forBrowser('chrome').build();
    await driver.get(url);
    const mainDiv = await driver.findElement(By.xpath("//section[@id='block-system-main']/div"));
    const headerDiv = await mainDiv.findElement(By.xpath("./div[@class='view-header']"));
    await doCdesHeader(ninds, headerDiv);
    const contentDiv = await mainDiv.findElement(By.xpath("./div[@class='view-content']"));
    const cdeTableElement = await contentDiv.findElement(By.xpath('./div/table'));
    await doCdesTable(ninds, cdeTableElement);
    await driver.close();
    return ninds;
}

async function doDomainName(domainElement: any) {
    const domainNameElement = await domainElement.findElement(By.xpath("./div[@class='view-grouping-header']"));
    const domainNameText = await domainNameElement.getText();
    return domainNameText.trim();
}

async function doDomainTable(disorder: any, domainElement: any, domainName: string, subDiseaseName: string = '') {
    const domainTable = await domainElement.findElement(By.xpath("./div[@class='view-grouping-content']/div/table"));
    const trElements = await domainTable.findElements(By.xpath('./tbody/tr'));
    for (const trElement of trElements) {
        const tds = await trElement.findElements(By.xpath('./td'));
        const formName = await tds[0].getText();
        const formIdElements = await tds[0].findElements(By.xpath('./a'));
        let formId = '';
        if (formIdElements.length === 1) {
            formId = await formIdElements[0].getAttribute('title');
        } else {
            console.log('No formId found.');
            process.exit(1);
        }
        const ninds: any = {
            url: disorder.url,
            diseaseName: disorder.disorderName,
            subDiseaseName,
            domainName,
            formName,
            formId
        };
        const existingNinds = await NindsModel.findOne(ninds);
        if (existingNinds) {
            console.log(`${disorder.url}  ${formId} ${formName} has loaded. Skipping...`);
        } else {
            const aElements = await tds[1].findElements(By.xpath('./a'));
            if (aElements.length === 1) {
                console.log(`${disorder.url}  ${formId} ${formName} has Cdes. Loading...`);
                const cdeUrl = await aElements[0].getAttribute('href');
                await doCdes(ninds, cdeUrl);
            } else {
                console.log(`${disorder.url}  ${formId} ${formName}  has no Cdes.`);
            }
            await new NindsModel(ninds).save();
        }
    }
}

async function selectSubDisease(driver: any, subDiseaseName: string) {
    await driver.navigate().refresh();
    const selectXpath = "//*[@id='edit-field-sub-disease-name-value-selective-wrapper']//select";
    await driver.findElement(By.xpath(selectXpath)).click();
    // tslint:disable-next-line:max-line-length
    const selectedOptionXpath = `//*[@id='edit-field-sub-disease-name-value-selective-wrapper']//select//option[text()='${subDiseaseName}']`;
    await driver.findElement(By.xpath(selectedOptionXpath)).click();
}

async function doDomains(driver: any, disorder: any, subDiseaseName: string = '') {
    await driver.findElement(By.xpath("//button[normalize-space(text())='Expand All']")).click();

    // tslint:disable-next-line:max-line-length
    const domainDivXpath = "//div[div[p[button[normalize-space(text())='Collapse All']]]]/div[@class='view-content']/div[@class='view-grouping']";
    await driver.wait(until.elementLocated(By.xpath(domainDivXpath)), 10 * 1000);
    const domainElements = await driver.findElements(By.xpath(domainDivXpath));
    for (const domainElement of domainElements) {
        const domainName = await doDomainName(domainElement);
        await doDomainTable(disorder, domainElement, domainName, subDiseaseName);
    }
}

async function doDisorder(disorder: any) {
    console.log(`Fetch disorder: ${disorder.disorderName}`);
    const driver = await new Builder().forBrowser('chrome').build();
    await driver.get(disorder.url);
    const subDiseases: any = disorder.subDiseases;
    if (subDiseases && subDiseases.length) {
        for (const subDisease of subDiseases) {
            await selectSubDisease(driver, subDisease.name);
            const existingContentElementsXpath = "//div[div[p[button[normalize-space(text())='Expand All']]]]/div[@class='view-content']";
            await driver.wait(until.elementLocated(By.xpath(existingContentElementsXpath)), 30 * 1000);
            console.log(`done waiting for... ${subDisease.name}`);
            await doDomains(driver, disorder, subDisease.name);
        }
    } else {
        await doDomains(driver, disorder);
    }
    await driver.close();
}

async function run() {
    for (const disorder of DISORDERS.slice(0, 1)) {
        await doDisorder(disorder);
    }
}

run().then(() => {
}, error => console.log(error));
