const By = require('selenium-webdriver').By;

exports.parseGeneralReferences = async element => {
    let generalReferences = [];
    let pElements = await element.findElements(By.xpath('p'));
    for (let pElement of pElements) {
        let pText = await pElement.getText();
        let p = pText.trim();
        if (p) generalReferences.push(p);
    }
    return generalReferences;
};