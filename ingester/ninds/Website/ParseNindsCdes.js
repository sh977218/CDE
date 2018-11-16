const webdriver = require('selenium-webdriver');
const By = webdriver.By;

let driver = new webdriver.Builder().forBrowser('chrome').build();

doCde = async (trElement, map) => {
    let cde = {};
    let tdElements = await trElement.findElements(By.xpath('td'));
    let i = 0;
    for (let tdElement of tdElements) {
        i++;
        let key = map[i];
        let valueText = await tdElement.getText();
        let value = valueText.trim();
        cde[key] = value;
    }
    return cde;
};

doCdes = async trElements => {
    let cdes = [];

    if (trElements.length === 0) return cdes;

    let hTdMap = {};
    let i = 0;
    let hTds = await trElements[0].findElements(By.xpath('td'));
    for (let tTd of hTds) {
        i++;
        let keyText = await tTd.getText();
        let dotIndex = keyText.indexOf('(e.g.');
        let key = keyText.trim();
        if (dotIndex !== -1) {
            key = key.substr(0, dotIndex).trim();
        }
        hTdMap[i] = key.trim();
    }
    trElements.shift();
    for (let trElement of trElements) {
        let cde = await doCde(trElement, hTdMap);
        cdes.push(cde);
    }
    return cdes;
};

exports.doOnePage = async href => {
    await driver.get(href);
    let cdesTotalPageText = await driver.findElement(By.id("viewer_ctl01_ctl01_ctl04")).getText();
    let cdesTotalPage = Number.parseFloat(cdesTotalPageText.trim());

    let resultMap = {};
    let keys = ['Disease: ', 'SubDisease: '];
    let prefix_xpath = '//*[contains(@id,"ReportCell")]/table/tbody/tr[2]/td/table/tbody/tr/td/table/tbody/tr/td[3]/table/tbody/tr/td/div//div[contains(text(),"';
    let postfix_xpath = '")]';
    for (let key of keys) {
        let xpath = prefix_xpath + key + postfix_xpath;
        let elements = await driver.findElements(By.xpath(xpath));
        if (elements.length === 1) {
            let text = await elements[0].getText();
            resultMap[key.replace(':', '').trim()] = text.replace(key, '').trim();
        }
    }

    let cdes = [];
    for (let i = 1; i <= cdesTotalPage; i++) {
        let selector = "//tbody[tr/td/div[text() = 'CDE ID']]/tr[@valign='top']";
        let trElements = await driver.findElements(By.xpath(selector));
        let _cdes = await doCdes(trElements);
        cdes = cdes.concat(_cdes);
        if (i < cdesTotalPage) {
            await driver.findElement(By.xpath("//*[ @id='viewer_ctl01_ctl01_ctl05_ctl00']/tbody/tr/td/input")).click();
        }
    }

    cdes.forEach(cde => {
        Object.assign(cde, resultMap);
    });

    return cdes;
};
