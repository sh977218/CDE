const webdriver = require('selenium-webdriver');
const By = webdriver.By;

const baseUrl = 'https://commondataelements.ninds.nih.gov/#page=Default';

exports.parseDisease = async () => {
    let driver = new webdriver.Builder().forBrowser('chrome').build();
    let diseases = [];
    await driver.get(baseUrl);
    let linkElements = await driver.findElements(By.xpath("//*[@id='cde_menu']/li"));
    for (let linkElement of linkElements) {
        let anchorElements = await linkElement.findElements(By.xpath('a'));
        if (anchorElements.length === 1) {
            let disease = await anchorElements[0].getAttribute('textContent');
            let href = await anchorElements[0].getAttribute('href');
            diseases.push({url: href, name: disease.trim()})
        }
    }
    return diseases;

};