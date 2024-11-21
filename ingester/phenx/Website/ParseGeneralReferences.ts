import {By} from 'selenium-webdriver';

export async function parseGeneralReferences(element) {
    let generalReferences = [];
    let pElements = await element.findElements(By.xpath('p'));
    for (let pElement of pElements) {
        let pText = await pElement.getText();
        let p = pText.trim();
        if (p) generalReferences.push(p);
    }
    return generalReferences;
}