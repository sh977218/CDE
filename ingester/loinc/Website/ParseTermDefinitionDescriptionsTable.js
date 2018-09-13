const By = require('selenium-webdriver').By;

exports.parseTermDefinitionDescriptionsTable = async (element, cb) => {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    let definitions = [];
    if (trs.length % 3 !== 0) throw new Error('Term definition error');
    let num_definitions = trs.length / 3;
    for (let i = 0; i < num_definitions; i++) {
        let descriptionTr = trs[i];
        let description = await descriptionTr.getText();
        let sourceTr = trs[i + 1];
        let sourceTds = await sourceTr.findElements(By.xpath('td'));
        if (sourceTds.length !== 2) throw new Error('Term definition error, source Td');
        let sourceTd = sourceTds[1];
        let sourceKey = await sourceTd.findElement(By.xpath('span')).getText();
        let sourceString = await sourceTd.getText();
        let spaceTr = trs[i + 2];
        let spaceClass = await spaceTr.getAttribute('class');
        if (spaceClass.trim().indexOf('half_space') === -1) throw new Error('Term definition error, space class');
        definitions.push({
            definition: description.trim(),
            tag: [sourceString.trim().replace(sourceKey.trim(), '').trim()]
        })
    }
    cb(definitions);
};