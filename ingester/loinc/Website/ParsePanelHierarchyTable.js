const By = require('selenium-webdriver').By;


exports.parsePanelHierarchyTable = async (element, cb) => {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    trs.pop();

    // Parse this form
    let tds = await trs[0].findElements(By.xpath('td'));
    let result = await parseOneRow(tds);
    result.elements = [];
    let preLevel = 0;
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));
        tds.shift();
        let rowResult = await parseOneRow(tds);
        let span = await tds[0].findElement(By.xpath('span'));
        let spanText = await span.getText();
        let a = await span.findElement(By.xpath('a'));
        let aText = await a.getText();
        let spaces = spanText.replace(aText, '');
        let currentLevel = spaces.length / 5;
        if (currentLevel === preLevel) result.elements.push(rowResult);
        else if (currentLevel > level) {
            rowResult.elements = [];
            rowResult.elements.push(rowResult);
        } else {

        }
        console.log('spanText:****' + spanText + '****');
        console.log('aText:****' + aText + '****');
        console.log('***********');
    }
    cb(result);
};

parseOneRow = tds => {
    return new Promise(async (resolve, reject) => {
        let result = {};
        let loincIdText = await tds[0].getText();
        result.loincId = loincIdText.trim();
        let LoincNameText = await tds[1].getText();
        result.loincName = LoincNameText.trim();
        let rocText = await tds[2].getText();
        result.roc = rocText.trim();
        let cardinalityText = await tds[3].getText();
        result.cardinality = cardinalityText.trim();
        let exUcumUnitsText = await tds[4].getText();
        result.exUcumUnitsText = exUcumUnitsText.trim();
        resolve(result);
    })
};