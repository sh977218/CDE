const webdriver = require('selenium-webdriver');
const By = webdriver.By;

let NindsModel = require('../../createMigrationConnection').NindsModel;

const doOnePage = require('./ParseNindsCdes').doOnePage;
const parseDiseases = require('./ParseDiseases').parseDisease;

let formCounter = 0;

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

    let id = await domainElement.getAttribute('id');
    let cdeTableElement = await driver.findElement(By.xpath("//*[@id='" + id + "']/following-sibling::table"));

    let existingDbCount = await NindsModel.count(disease);
    let existingWebCount = await driver.findElements(By.xpath("//*[@id='" + id + "']/following-sibling::table/tbody/tr//td"))
    if (existingDbCount >= existingWebCount) {
        console.log("***********************************************************************");
        console.log("Previously Finished Disease " + disease.name + " on page " + disease.url);
        console.log("***********************************************************************");
        return;
    }

    let trElements = await cdeTableElement.findElements(By.xpath('tbody/tr'));
    for (let trElement of trElements) {
        let subDomain = '';
        let thElements = await trElement.findElements(By.xpath('th'));
        let tdElements = await trElement.findElements(By.xpath('td'));
        if (tdElements.length === 0) {
            let subDomainText = await thElements[0].getText();
            subDomain = subDomainText.trim();
        } else {
            let cond = await getFormInfo(trElement);
            cond.url = disease.url;
            if (domain) cond.domain = domain;
            if (disease && disease.name) cond.disease = disease.name;
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
};

async function doDisease(disease) {
    let driver = new webdriver.Builder().forBrowser('chrome').build();
    await driver.get(disease.url);
    let titleElement = await driver.findElement(By.xpath("//*[@id='bcrumbTab']//following-sibling::h2"));
    let titleText = await titleElement.getText();
    let title = titleText.trim();
    disease.title = title;

    let domainElements = await driver.findElements(By.xpath("//*[@class='cdetable']/preceding-sibling::a"));
    for (let domainElement of domainElements) {
        await doDomain(driver, disease, domainElement);
    }
};

async function run() {
    let diseases = await parseDiseases();
    for (let disease of diseases) {
        await doDisease(disease);
    }
    console.log('formCounter: ' + formCounter);
}

run().then(async () => {
}, error => console.log(error));