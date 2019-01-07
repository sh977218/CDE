const _ = require('lodash');
const webdriver = require('selenium-webdriver');
const By = webdriver.By;
let driver = new webdriver.Builder().forBrowser('chrome').build();

let NindsModel = require('../../createMigrationConnection').NindsModel;

const doOnePage = require('./ParseNindsCdes').doOnePage;

let formCounter = 0;

let URL_PREFIX = 'https://www.commondataelements.ninds.nih.gov/';
let DEFAULT_XPATH = "//*[@id='Data_Standards']/a/following-sibling::table/tbody/tr//td";

const DISEASE_MAP = [
    {
        name: 'General',
        url: URL_PREFIX + 'General.aspx',
        xpath: DEFAULT_XPATH,
        count: 92,
        domainCount: 9
    },
    {
        name: 'Amyotrophic Lateral Sclerosis',
        url: URL_PREFIX + 'ALS.aspx',
        xpath: DEFAULT_XPATH,
        count: 98,
        domainCount: 9
    },
    {
        name: 'Cerebral Palsy',
        url: URL_PREFIX + 'CP.aspx',
        xpath: "//!*[@id='Data_Standards']/b/b/a/following-sibling::table/tbody/tr//td",
        count: 158,
        domainCount: 10
    },
    {
        name: 'Chiari I Malformation',
        url: URL_PREFIX + 'CM.aspx',
        xpath: DEFAULT_XPATH,
        count: 71,
        domainCount: 10
    },
    {
        name: 'Epilepsy',
        url: URL_PREFIX + 'Epilepsy.aspx',
        xpath: DEFAULT_XPATH,
        count: 104,
        domainCount: 9
    },
    {
        name: "Friedreich's Ataxia",
        url: URL_PREFIX + 'FA.aspx',
        xpath: DEFAULT_XPATH,
        count: 53,
        domainCount: 9
    },
    {
        name: 'Headache',
        url: URL_PREFIX + 'Headache.aspx',
        xpath: DEFAULT_XPATH,
        count: 74,
        domainCount: 9
    },
    {
        name: "Huntington’s Disease",
        url: URL_PREFIX + 'HD.aspx',
        xpath: DEFAULT_XPATH,
        count: 86,
        domainCount: 9
    },
    {
        name: 'Mitochondrial Disease',
        url: URL_PREFIX + 'MITO.aspx',
        xpath: DEFAULT_XPATH,
        count: 132,
        domainCount: 9
    },
    {
        name: 'Multiple Sclerosis',
        url: URL_PREFIX + 'MS.aspx',
        xpath: DEFAULT_XPATH,
        count: 105,
        domainCount: 9
    },
    {
        name: 'Myalgic Encephalomyelitis/Chronic Fatigue Syndrome',
        url: URL_PREFIX + 'MECFS.aspx',
        xpath: DEFAULT_XPATH,
        count: 136,
        domainCount: 10
    },
    {
        name: 'Neuromuscular Diseases',
        url: URL_PREFIX + 'NMD.aspx',
        xpath: DEFAULT_XPATH,
        count: 80,
        domainCount: 9
    },
    {
        name: 'Congenital Muscular Dystrophy',
        url: URL_PREFIX + 'CMD.aspx',
        xpath: DEFAULT_XPATH,
        count: 61,
        domainCount: 9
    },
    {
        name: 'Duchenne/Becker Muscular Dystrophy',
        url: URL_PREFIX + 'DMD.aspx',
        xpath: DEFAULT_XPATH,
        count: 50,
        domainCount: 6
    },
    {
        name: 'Facioscapulohumeral muscular dystrophy (FSHD)',
        url: URL_PREFIX + 'FSHD.aspx',
        xpath: DEFAULT_XPATH,
        count: 41,
        domainCount: 9
    },
    {
        name: 'Myasthenia Gravis',
        url: URL_PREFIX + 'MG.aspx',
        xpath: DEFAULT_XPATH,
        count: 54,
        domainCount: 9
    },
    {
        name: 'Myotonic Dystrophy',
        url: URL_PREFIX + 'MMD.aspx',
        xpath: DEFAULT_XPATH,
        count: 51,
        domainCount: 9
    },
    {
        name: 'Spinal Muscular Atrophy',
        url: URL_PREFIX + 'SMA.aspx',
        xpath: DEFAULT_XPATH,
        count: 62,
        domainCount: 9
    },
    {
        name: "Parkinson's Disease",
        url: URL_PREFIX + 'PD.aspx',
        xpath: DEFAULT_XPATH,
        count: 140,
        domainCount: 9
    },
    {
        name: 'Spinal Cord Injury',
        url: URL_PREFIX + 'SCI.aspx',
        xpath: DEFAULT_XPATH,
        count: 196,
        domainCount: 11
    },
    {
        name: 'Stroke',
        url: URL_PREFIX + 'Stroke.aspx',
        xpath: DEFAULT_XPATH,
        count: 82,
        domainCount: 9
    },
    {
        name: 'Unruptured Cerebral Aneurysms and Subarachnoid Hemorrhage',
        url: URL_PREFIX + 'SAH.aspx',
        xpath: DEFAULT_XPATH,
        count: 130,
        domainCount: 8
    },
    {
        name: 'Traumatic Brain Injury',
        url: URL_PREFIX + 'TBI.aspx',
        xpath: DEFAULT_XPATH,
        count: 261,
        domainCount: 9
    },
    {
        name: 'Sport-Related Concussion',
        url: URL_PREFIX + 'SRC.aspx',
        xpath: DEFAULT_XPATH,
        count: 186,
        domainCount: 8
    }
];

getFormInfo = async trElement => {
    let thElements = await trElement.findElements(By.xpath('th'));
    let thElement = thElements[0];

    let formNameText = await thElement.getText();
    let formName = formNameText.trim();

    let formNoteElements = await thElement.findElements(By.css('formnote'));
    if (formNoteElements.length === 1) {
        let formNoteText = await formNoteElements[0].getText();
        let formNote = formNoteText.trim();
        formName.replace(formNote, '').trim();
    }

    let formIdText = await thElement.getAttribute('id');
    let formId = formIdText.trim();

    let copyrightElements = await thElement.findElements(By.css('copyright'));
    if (copyrightElements.length === 1) {
        let copyrightText = await copyrightElements[0].getText();
        let copyright = copyrightText.trim();
        formName.replace(copyright, '').trim();
    }
    return {
        formId: formId,
        formName: formName
    }
};

doTrElement = async trElement => {
    let form = {};
    let thElements = await trElement.findElements(By.xpath('th'));
    let tdElements = await trElement.findElements(By.xpath('td'));

    let thElement = thElements[0];
    let tdElement = tdElements[0];

    let formNameText = await thElement.getText();
    form.formName = formNameText.trim();

    let formNoteElements = await thElement.findElements(By.css('formnote'));
    if (formNoteElements.length === 1) {
        let formNoteText = await formNoteElements[0].getText();
        let formNote = formNoteText.trim();
        form.formName.replace(formNote, '').trim();
    }

    let formIdText = await thElement.getAttribute('id');
    let formId = formIdText.trim();
    form.formId = formId;

    let anchorElements = await thElement.findElements(By.xpath('a'));
    if (anchorElements.length === 1) {
        let downloadLinkText = await anchorElements[0].getAttribute('href');
        form.downloadLink = downloadLinkText.trim();
    }

    let copyrightElements = await thElement.findElements(By.css('copyright'));
    if (copyrightElements.length === 1) {
        let copyrightText = await copyrightElements[0].getText();
        let copyright = copyrightText.trim();
        form.copyright = true;
        form.formName.replace(copyright, '').trim();
    }

    let cdeLinkElements = await tdElement.findElements(By.xpath('a'));
    if (cdeLinkElements.length === 1) {
        let hrefText = await cdeLinkElements[0].getAttribute('href');
        let href = hrefText.trim();
        form.cdes = await doOnePage(href);
    } else form.cdes = [];
    return form;
};

doDomain = async (driver, disease, domainElement) => {
    let domainText = await domainElement.getText();
    let domain = domainText.trim();

    /*
    html could be:
    <a>
    <table>
    -----------
    <a>
    <p>
    <table>
    -----------
    <a>
    <p>
    (missing table)
    <a>
    <p>
    <table>
     */
    let id = await domainElement.getAttribute('id');
    let followingElements = await driver.findElements(By.xpath("//*[@id='" + id + "']/following-sibling::*"));
    let followingElementTags = [];
    for (let followingElement of followingElements) {
        let nextElementTags = await followingElement.getTagName();
        followingElementTags.push(nextElementTags);
    }
    let cdeTableElement;

    let tableIndex = followingElementTags.indexOf('table');
    if (tableIndex === 0) cdeTableElement = followingElements[0];
    else if (tableIndex === 1) cdeTableElement = followingElements[1];
    else console.log(domain + ' has no table.');
    if (cdeTableElement) {
        let trElements = await cdeTableElement.findElements(By.xpath('tbody/tr'));
        let subDomain = '';
        for (let trElement of trElements) {
            let thElements = await trElement.findElements(By.xpath('th'));
            let tdElements = await trElement.findElements(By.xpath('td'));
            if (tdElements.length === 0) {
                let subDomainText = await thElements[0].getText();
                subDomain = subDomainText.trim();
            } else {
                let cond = await getFormInfo(trElement);
                cond.url = disease.url;
                cond.domain = domain;
                cond.disease = disease.name;
                let existingNinds = await NindsModel.findOne(cond);
                if (!existingNinds) {
                    let formObj = await doTrElement(trElement);
                    formObj.subDomain = subDomain;
                    formObj.domain = domain;
                    formObj.disease = disease.name;
                    formObj.url = disease.url;
                    await new NindsModel(formObj).save();
                    formCounter++;
                    console.log('formCounter: ' + formCounter);
                } else {
                    formCounter++;
                    console.log('formCounter: ' + formCounter + ' skipped.');
                }
            }
        }
    }
};

async function doDisease(disease) {
    await driver.get(disease.url);
    let domainElements = await driver.findElements(By.xpath("//*[@class='cdetable']/preceding-sibling::a"));
    if (domainElements.length !== disease.domainCount) {
        console.log(disease.name + ' domain count: ' + domainElements.length + '. Web: ' + disease.domainCount);
        process.exit(1);
    }
    for (let domainElement of domainElements) {
        await doDomain(driver, disease, domainElement);
    }
};

async function run() {
    for (let disease of DISEASE_MAP) {
        let existingDbCount = await NindsModel.countDocuments({disease: disease.name});
        if (existingDbCount >= disease.count) {
            console.log("***********************************************************************");
            console.log("Previously Finished Disease " + disease.name + " on page " + disease.url);
            console.log("***********************************************************************");
        } else {
            await doDisease(disease);
            let savedCount = await NindsModel.countDocuments({disease: disease.name});
            if (savedCount !== disease.count) {
                console.log(disease.name + ' savedCount: ' + savedCount + '. Web: ' + disease.count);
                process.exit(1);
            }
        }
    }
}

run().then(() => {
}, error => console.log(error));
