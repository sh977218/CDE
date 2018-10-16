const By = require('selenium-webdriver').By;

exports.parseWebContentTable = async (driver, loincId, element, cb) => {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    let webContents = [];
    let webContent = "";
    for (let tr  of trs) {
        let classes = await tr.getAttribute('class');
        if (classes.indexOf('half_space') !== -1) {
            let text = await tr.getText();
            webContent = webContent + text;
        } else {
            webContents.push(webContent);
            webContent = "";
        }
    }
    cb(webContents);
};