import {By} from 'selenium-webdriver';

export async function parseRequirements(element) {
    let requirements = [];
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let requirement = {};
        let tds = await tr.findElements(By.xpath('td'));
        let requirementCategoryString = await tds[0].getText();
        requirement['Requirement Category'] = requirementCategoryString.trim();

        let requiredString = await tds[1].getText();
        requirement['Required'] = requiredString.trim();

        requirements.push(requirement);
    }
    return requirements;
}