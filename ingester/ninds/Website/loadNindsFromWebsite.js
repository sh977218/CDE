const webdriver = require('selenium-webdriver');
const By = webdriver.By;

let driver = new webdriver.Builder().forBrowser('chrome').build();

const baseUrl = 'https://commondataelements.ninds.nih.gov/#page=Default';

fetchAllLinks = async () => {
    let diseases = [];
    await driver.get(baseUrl);
    let linkElements = await driver.findElements(By.xpath("//*[@id='cde_menu']/li"));
    for (let linkElement of linkElements) {
        let anchorElement = await linkElement.findElement(By.xpath('a'));
        let disease = await anchorElement.getAttribute('textContent');
        let href = await anchorElement.getAttribute('href');
        diseases.push({url: href, name: disease.trim()})
    }
    return diseases;
};

doDomain = async domainElement => {
    let domainText = await domainElement.getText();
    let domain = domainText.trim();

    let id = await domainElement.getAttribute('id');

    let cdeTableElement = await driver.findElement(By.xpath("//*[@id=" + id + "]/following-sibling::table"))

    let trs = await cdeTableElement.findElements(By.xpath('tbody/tr'));
    let subDomain = '';
    for (let tr of trs) {
        let ths = await tr.findElements(By.xpath('th'));
        let tds = await tr.findElements(By.xpath('td'));
        if (tds.length === 0) {
            let subDomainText = await trs[0].getText();
            subDomain = subDomainText.trim();
        } else {
            let th = ths[0];
            let td = tds[0];
        }

    }
    console.log('a');

};

doDisease = async disease => {
    await driver.get(disease.url);

    let titleElement = await driver.getElement(By.xpath("//*[@id='bcrumbTab']//following-sibling::h2"));
    let titleText = await titleElement.getText();
    let title = titleText.trim();

    let domainElements = await driver.getElements(By.xpath("//*[@class='cdetable']/preceding-sibling::a"));
    for (let domainElement of domainElements) {
        await doDomain(domainElement);
    }

};

async function run() {
    let diseases = await fetchAllLinks(driver);
    for (let disease of diseases) {
        await doDisease(disease);
    }
    console.log('a');
}

run().then(() => {
}, error => console.log(error));