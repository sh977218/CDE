import {By} from 'selenium-webdriver';

export async function parseVariables(element) {
    let variables = [];
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let variable = {};
        let tds = await tr.findElements(By.xpath('td'));
        let variableNameString = await tds[0].getText();
        variable['Variable Name'] = variableNameString.trim();

        let VariableIdString = await tds[1].getText();
        variable['Variable ID'] = VariableIdString.trim();

        let variableDescriptionString = await tds[2].getText();
        variable['Variable Description'] = variableDescriptionString.trim();

        let versionString = await tds[3].getText();
        variable['Version'] = versionString.trim();

        let mappingString = await tds[4].getText();
        variable['Mapping'] = mappingString.trim();

        variables.push(variable);
    }
    return variables;
}