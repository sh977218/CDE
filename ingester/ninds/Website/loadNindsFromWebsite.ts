import { Builder, By } from 'selenium-webdriver';
import { indexOf, replace } from 'lodash';
import { NindsModel } from 'ingester/createMigrationConnection';

require('chromedriver');

const URL_PREFIX = 'https://www.commondataelements.ninds.nih.gov/';
const DEFAULT_XPATH = "//*[@id='Data_Standards']/a/following-sibling::table/tbody/tr//td";

// tslint:disable-next-line:max-line-length
// document count xpath: div[div[p[button[normalize-space(text())='Expand All']]]]/div[@class='view-content']/div[@class='view-grouping']/div[@class='view-grouping-content']/div/table/tbody/tr
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
    },
    /* {
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
    }*/
];

async function doCdesHeader(headerDiv: any) {
    let disorderName = '';
    let subDomainName = '';
    let paginationInfo = await headerDiv.getText();
    const elements = await headerDiv.findElements('./');
    for (const element of elements) {
        const text = await element.getText();
        if (indexOf(text, 'Disease: ') !== -1) {
            disorderName = replace(text, 'Disease: ', '');
            paginationInfo = replace(paginationInfo, text, '');
        }
        if (indexOf(text, 'Sub-Domain: ') !== -1) {
            subDomainName = replace(text, 'Sub-Domain: ', '');
            paginationInfo = replace(paginationInfo, text, '');
        }
    }
    return {disorderName, subDomainName, paginationInfo};
}

async function doCdesTable(cdeTableElement: any) {
    const cdes = [];
    const keys = [];
    const ths = await cdeTableElement.findElements(By.xpath('./thead/tr/th'));
    for (const th of ths) {
        const key = await th.getText();
        keys.push(key.trim());
    }
    const trs = await cdeTableElement.findElements(By.xpath('./tbody/tr'));
    for (const tr of trs) {
        const cde: any = {};
        const tds = await tr.findElements(By.xpath('/td'));

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < tds.length; i++) {
            const td = tds[i];
            const value = await td.getText();
            cde[keys[i]] = value.trim();
        }
        cdes.push(cde);
    }
    return cdes;
}

async function doCdes(url: string) {
    const driver = await new Builder().forBrowser('chrome').build();
    await driver.get(url);
    const mainDiv = await driver.findElement(By.xpath("//section[@id='block-system-main']/div"));
    const headerDiv = await mainDiv.findElement(By.xpath("./div[@class='view-header']"));
    const ninds: any = doCdesHeader(headerDiv);
    const contentDiv = await mainDiv.findElement(By.xpath("./div[@class='view-content']"));
    const cdeTableElement = await contentDiv.findElement(By.xpath('./div/table'));
    const cdes = await doCdesTable(cdeTableElement);
    ninds.cdes = cdes;
    return ninds;
}

async function doDomainName(domainElement: any) {
    const domainNameElement = await domainElement.findElement(By.xpath("./div[@class='view-grouping-header']"));
    const domainNameText = await domainNameElement.getText();
    const domainName = domainNameText.trim();
    return domainName;
}

async function doDomainTable(domainElement: any, domainName: string) {
    const domainTable = await domainElement.findElement(By.xpath("./div[@class='view-grouping-content']/div/table"));
    const trElements = await domainTable.findElements(By.xpath('./tbody/tr'));
    for (const trElement of trElements) {
        const tds = await trElement.findElements(By.xpath('./td'));
        const formName = await tds[0].getText();
        const formIdElement = await tds[0].findElement(By.xpath('./a'));
        const formId = await formIdElement.getAttribute('title');
        const aElement = await tds[0].findElement(By.xpath('./a'));
        const cdeUrl = await aElement.getAttribute('href');
        const ninds = await doCdes(cdeUrl);
        ninds.domainName = domainName;
        ninds.formName = formName;
        ninds.formId = formId;
        await new NindsModel(ninds).save();
    }
}

async function doDisorder(disorder: any) {
    const driver = await new Builder().forBrowser('chrome').build();
    // tslint:disable-next-line:max-line-length
    const domainDivXpath = "//div[div[p[button[normalize-space(text())='Expand All']]]]/div[@class='view-content']/div[@class='view-grouping']";
    const domainElements = await driver.findElements(By.xpath(domainDivXpath));
    for (const domainElement of domainElements) {
        const domainName = await doDomainName(domainElement);
        await doDomainTable(domainElement, domainName);
    }
}

async function run() {
    for (const disorder of DISORDERS) {
        await doDisorder(disorder);
        /*
                const existingDocumentCount = await NindsModel.countDocuments(disorder);
                if (existingDocumentCount === disease.count) {
                    console.log('***********************************************************************');
                    console.log(`Previously Finished Disease  ${disease.disorderName}. Skipping... `);
                    console.log('***********************************************************************');
                } else {
                }

        */
    }
}

run().then(() => {
}, error => console.log(error));
/*
if (disease.subDiseases) {
    for (const subDisease of disease.subDiseases) {
        const _existingSubDiseasesCount = await NindsModel.countDocuments({
            disease: disease.disorderName,
            subDisease: subDisease.name
        });
        if (_existingSubDiseasesCount === subDisease.count) {
            console.log('***********************************************************************');
            console.log(`Previously Finished Disease ${disease.name} SubDisease ${subDisease.name} on page ${disease.url}`);
            console.log('***********************************************************************');
        } else {
            await driver.get(disease.url);
            disease.subDisease = subDisease.name;
            await driver.findElement(By.id('ddlSubDisease')).click();
            const subDiseaseXpath = "//!*[@id='ddlSubDisease']//option[normalize-space(text())='" + subDisease.name + "']";
            await driver.findElement(By.xpath(subDiseaseXpath)).click();
            if (subDisease.existingXpath) {
                const timeout = setInterval(async () => {
                    const existingElement = await driver.findElement(By.xpath(subDisease.existingXpath));
                    let existingElementText = '';
                    if (disease.name === 'Traumatic Brain Injury') {
                        existingElementText = await existingElement.getAttribute('id');
                    } else {
                        existingElementText = await existingElement.getText();
                    }
                    if (existingElementText.trim() === subDisease.existingText) {
                        clearInterval(timeout);
                    }
                }, 20 * 1000);
            }
            await doDisease(disease);
        }
    }
}
*/
