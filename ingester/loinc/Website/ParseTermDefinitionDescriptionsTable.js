const By = require('selenium-webdriver').By;

exports.parseTermDefinitionDescriptionsTable = async (driver, loincId, element, cb) => {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    let definitions = [];
    let definition = {};
    for (let tr of trs) {
        let classes = await tr.getAttribute('class');
        if (classes.indexOf('half_space') !== -1) {
            let tds = await tr.findElements(By.xpath('td'));
            if (tds.length !== 2)
                throw new Error('Term definition error, Td ' + loincId);
            let description = await tds[1].getText();
            definition.description = description.trim();
        } else {
            definitions.push(definition);
            definition = {};
        }
    }
    cb(definitions);
};