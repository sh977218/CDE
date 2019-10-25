import { Builder, By } from 'selenium-webdriver';
import { indexOf, replace } from 'lodash';
import { NindsModel } from 'ingester/createMigrationConnection';

require('chromedriver');

const doOnePage = require('./ParseNindsCdes').doOnePage;

let formCounter = 0;

const URL_PREFIX = 'https://www.commondataelements.ninds.nih.gov/';
const DEFAULT_XPATH = "//*[@id='Data_Standards']/a/following-sibling::table/tbody/tr//td";


// tslint:disable-next-line:max-line-length
// domain count xpath: //div[div[p[button[normalize-space(text())='Expand All']]]]/div[@class='view-content']/div[@class='view-grouping']/div[@class='view-grouping-header']
// tslint:disable-next-line:max-line-length
// document count xpath: //div[div[p[button[normalize-space(text())='Expand All']]]]/div[@class='view-content']/div[@class='view-grouping']/div[@class='view-grouping-content']/div/table/tbody/tr
const DISEASE_MAP = [
    {
        diseaseName: 'General (For all diseases)',
        subDiseaseName: '',
        url: URL_PREFIX + 'General%20%28For%20all%20diseases%29',
        xpath: DEFAULT_XPATH,
        count: 93,
        domainCount: 8
    },
    {
        diseaseName: 'Amyotrophic Lateral Sclerosis',
        subDiseaseName: '',
        url: URL_PREFIX + 'amyotrophic%20lateral%20sclerosis',
        xpath: DEFAULT_XPATH,
        count: 98,
        domainCount: 9
    },
    {
        diseaseName: 'Cerebral Palsy',
        subDiseaseName: '',
        url: URL_PREFIX + 'cerebral%20palsy',
        xpath: "//!*[@id='Data_Standards']/b/b/a/following-sibling::table/tbody/tr//td",
        count: 158,
        domainCount: 10
    },
    {
        diseaseName: 'Chiari I Malformation',
        subDiseaseName: '',
        url: URL_PREFIX + 'Chiari%20I%20Malformation',
        xpath: DEFAULT_XPATH,
        count: 71,
        domainCount: 10
    },
    {
        diseaseName: 'Epilepsy',
        subDiseaseName: '',
        url: URL_PREFIX + 'epilepsy',
        xpath: DEFAULT_XPATH,
        count: 104,
        domainCount: 9
    },
    {
        diseaseName: "Friedreich's Ataxia",
        subDiseaseName: '',
        url: URL_PREFIX + 'Friedreich%27s%20Ataxia',
        xpath: DEFAULT_XPATH,
        count: 53,
        domainCount: 9
    },
    {
        diseaseName: 'Headache',
        subDiseaseName: '',
        url: URL_PREFIX + 'headache',
        xpath: DEFAULT_XPATH,
        count: 74,
        domainCount: 9
    },
    {
        diseaseName: 'Huntington’s Disease',
        subDiseaseName: '',
        url: URL_PREFIX + 'Huntington%27s%20Disease',
        xpath: DEFAULT_XPATH,
        count: 86,
        domainCount: 9
    },
    {
        diseaseName: 'Mitochondrial Disease',
        subDiseaseName: '',
        url: URL_PREFIX + 'Mitochondrial%20Disease',
        xpath: DEFAULT_XPATH,
        count: 132,
        domainCount: 9
    },
    {
        diseaseName: 'Multiple Sclerosis',
        subDiseaseName: '',
        url: URL_PREFIX + 'Multiple%20Sclerosis',
        xpath: DEFAULT_XPATH,
        count: 105,
        domainCount: 9
    },
    {
        diseaseName: 'Myalgic Encephalomyelitis/Chronic Fatigue Syndrome',
        subDiseaseName: '',
        url: URL_PREFIX + 'Myalgic%20Encephalomyelitis/Chronic%20Fatigue%20Syndrome',
        xpath: DEFAULT_XPATH,
        count: 136,
        domainCount: 10
    },
    {
        diseaseName: 'Neuromuscular Diseases',
        subDiseaseName: '',
        url: URL_PREFIX + 'Myalgic%20Encephalomyelitis/Chronic%20Fatigue%20Syndrome',
        xpath: DEFAULT_XPATH,
        count: 80,
        domainCount: 9
    },
    {
        diseaseName: 'Congenital Muscular Dystrophy',
        subDiseaseName: '',
        url: URL_PREFIX + 'Congenital%20Muscular%20Dystrophy',
        xpath: DEFAULT_XPATH,
        count: 61,
        domainCount: 9
    },
    {
        diseaseName: 'Duchenne/Becker Muscular Dystrophy',
        subDiseaseName: '',
        url: URL_PREFIX + 'Duchenne%20Muscular%20Dystrophy/Becker%20Muscular%20Dystrophy',
        xpath: DEFAULT_XPATH,
        count: 50,
        domainCount: 6
    },
    {
        diseaseName: 'Facioscapulohumeral muscular dystrophy (FSHD)',
        subDiseaseName: '',
        url: URL_PREFIX + 'Facioscapulohumeral%20Muscular%20Dystrophy',
        xpath: DEFAULT_XPATH,
        count: 41,
        domainCount: 9
    },
    {
        diseaseName: 'Myasthenia Gravis',
        subDiseaseName: '',
        url: URL_PREFIX + 'Myasthenia%20Gravis',
        xpath: DEFAULT_XPATH,
        count: 54,
        domainCount: 9
    },
    {
        diseaseName: 'Myotonic Dystrophy',
        subDiseaseName: '',
        url: URL_PREFIX + 'Myotonic%20Muscular%20Dystrophy',
        xpath: DEFAULT_XPATH,
        count: 51,
        domainCount: 9
    },
    {
        diseaseName: 'Spinal Muscular Atrophy',
        subDiseaseName: '',
        url: URL_PREFIX + 'Spinal%20Muscular%20Atrophy',
        xpath: DEFAULT_XPATH,
        count: 62,
        domainCount: 9
    },
    {
        diseaseName: "Parkinson's Disease",
        subDiseaseName: '',
        url: URL_PREFIX + 'Parkinson%27s%20Disease',
        xpath: DEFAULT_XPATH,
        count: 140,
        domainCount: 9
    },
    {
        diseaseName: 'Spinal Cord Injury',
        subDiseaseName: '',
        url: URL_PREFIX + 'Spinal%20Cord%20Injury',
        xpath: DEFAULT_XPATH,
        count: 196,
        domainCount: 11
    },
    {
        diseaseName: 'Stroke',
        subDiseaseName: '',
        url: URL_PREFIX + 'Stroke',
        xpath: DEFAULT_XPATH,
        count: 82,
        domainCount: 9
    },
    {
        diseaseName: 'Unruptured Cerebral Aneurysms and Subarachnoid Hemorrhage',
        subDiseaseName: '',
        url: URL_PREFIX + 'Unruptured%20Cerebral%20Aneurysms%20and%20Subarachnoid%20Hemorrhage',
        xpath: DEFAULT_XPATH,
        count: 130,
        domainCount: 8
    },
    {
        diseaseName: 'Traumatic Brain Injury',
        subDiseaseName: '',
        url: URL_PREFIX + 'Traumatic%20Brain%20Injury',
        xpath: DEFAULT_XPATH,
        count: 261 + 250 + 249 + 247 + 247,
        domainCount: 9,
        subDisease: '',
        subDiseases: [{
            name: 'Acute Hospitalized',
            existingFormXpath: "//th[a[span[normalize-space(text())='Demographics']]]",
            existingText: 'formF1534',
            count: 250
        }, {
            name: 'Comprehensive',
            existingFormXpath: "//th[a[span[normalize-space(text())='Demographics']]]",
            existingText: 'formF0300',
            count: 261
        }, {
            name: 'Concussion/Mild TBI',
            existingXpath: "//th[a[span[normalize-space(text())='Demographics']]]",
            existingText: 'formF1535',
            count: 249
        }, {
            name: 'Epidemiology',
            existingXpath: "//th[a[span[normalize-space(text())='Demographics']]]",
            existingText: 'formF1537',
            count: 247
        }, {
            name: 'Moderate/Severe TBI: Rehabilitation',
            existingXpath: "//th[a[span[normalize-space(text())='Demographics']]]",
            existingText: 'formF1536',
            count: 247
        }]
    },
    {
        diseaseName: 'Sport-Related Concussion',
        subDiseaseName: '',
        demographicsXpath: "//th[a[span[normalize-space(text())='Demographics Form']]]",
        url: URL_PREFIX + 'Sport%20Related%20Concussion',
        xpath: DEFAULT_XPATH,
        count: 186 + 119 + 178 + 178,
        domainCount: 8,
        subDiseases: [{
            name: 'Acute',
            existingXpath: "//*[@id='ContentPlaceHolder1_DataStandards_lbDownload']",
            existingText: 'Download Acute CDE Recommendations',
            count: 119
        }, {
            name: 'Comprehensive',
            existingXpath: "//*[@id='ContentPlaceHolder1_DataStandards_lbDownload']",
            existingText: 'Download Comprehensive CDE Recommendations',
            count: 186
        }, {
            name: 'Persistent/Chronic',
            existingXpath: "//*[@id='ContentPlaceHolder1_DataStandards_lbDownload']",
            existingText: 'Download Persistent/Chronic CDE Recommendations',
            count: 178
        }, {
            name: 'Subacute',
            existingXpath: "//*[@id='ContentPlaceHolder1_DataStandards_lbDownload']",
            existingText: 'Download Subacute CDE Recommendations',
            count: 178
        }]
    }
];

async function doCdeHeader(headerDiv: any) {
    let diseaseName = '';
    let subDomainName = '';
    let paginationInfo = await headerDiv.getText();
    const elements = await headerDiv.findElements('./');
    for (const element of elements) {
        const text = await element.getText();
        if (indexOf(text, 'Disease: ') !== -1) {
            diseaseName = replace(text, 'Disease: ', '');
            paginationInfo = replace(paginationInfo, text, '');
        }
        if (indexOf(text, 'Sub-Domain: ') !== -1) {
            subDomainName = replace(text, 'Sub-Domain: ', '');
            paginationInfo = replace(paginationInfo, text, '');
        }
    }
    return {diseaseName, subDomainName, paginationInfo};
}

async function doCdeTable(cdeTableElement: any) {
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
    const ninds: any = doCdeHeader(headerDiv);
    const contentDiv = await mainDiv.findElement(By.xpath("./div[@class='view-content']"));
    const cdeTableElement = await contentDiv.findElement(By.xpath('./div/table'));
    const cdes = await doCdeTable(cdeTableElement);
    ninds.cdes = cdes;
    return ninds;
}

async function doDomain(disease: any, domainDiv: any) {
    const domainNameDiv = await domainDiv.findElement(By.xpath("./div[@class='view-grouping-header']"));
    const domainText = await domainNameDiv.getText();
    const domainName = domainText.trim();
    const domainTable = await domainDiv.findElement(By.xpath("./div[@class='view-grouping-content']/div/table"));
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

async function doDisease(disease: any) {
    const driver = await new Builder().forBrowser('chrome').build();
    // tslint:disable-next-line:max-line-length
    const domainDivXpath = "//div[div[p[button[normalize-space(text())='Expand All']]]]/div[@class='view-content']/div[@class='view-grouping']";
    const domainDivs = await driver.findElements(By.xpath(domainDivXpath));
    for (const domainDiv of domainDivs) {
        await doDomain(disease, domainDiv);
    }
}

async function run() {
    for (const disease of DISEASE_MAP) {
        const existingDiseaseCount = await NindsModel.countDocuments({
            diseaseName: disease.diseaseName,
            subDiseaseName: disease.subDiseaseName,
            url: disease.url
        });
        if (existingDiseaseCount === disease.count) {
            console.log('***********************************************************************');
            console.log(`Previously Finished Disease  ${disease.diseaseName}. Skipping... `);
            console.log('***********************************************************************');
        } else {
            await doDisease(disease);
        }
        if (disease.subDiseases) {
            for (const subDisease of disease.subDiseases) {
                const _existingSubDiseasesCount = await NindsModel.countDocuments({
                    disease: disease.diseaseName,
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
                    const subDiseaseXpath = "//*[@id='ddlSubDisease']//option[normalize-space(text())='" + subDisease.name + "']";
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

    }
}

run().then(() => {
}, error => console.log(error));
