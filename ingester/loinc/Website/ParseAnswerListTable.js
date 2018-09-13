const By = require('selenium-webdriver').By;

exports.parseAnswerListTable = async (table, cb) => {
    let answerListObj = {
        answerListId: {},
        answerList: []
    };
    let answerListIdObj = answerListObj.answerListId;
    let answerListArray = answerListObj.answerList;
    let externalDefinedExist = false;

    let innerTable = await table.findElements(By.css('table'));
    if (innerTable.length > 0) {
        externalDefinedExist = true;
        let innerTrs = await innerTable[0].findElements(By.xpath('tbody/tr'));
        for (let innerTr of innerTrs) {
            let tds = await innerTr.findElements(By.xpath('td'));
            let keyText = await tds[0].getText();
            let key = keyText.replace(/:/g, '').trim();
            let valueText = await tds[1].getText();
            let value = valueText.trim();
            answerListObj[key] = value;
        }
    }

    let trs = await table.findElements(By.xpath('tbody/tr'));
    let a = await trs[0].findElement(By.css('a'));
    let urlText = await a.getAttribute('href');
    answerListIdObj.URL = urlText.trim();
    let idText = await a.getText();
    answerListIdObj.ID = idText.trim();

    trs.shift();
    if (externalDefinedExist) trs.shift();

    let thMapping = {};
    let ths = await trs[0].findElements(By.css('th'));

    let thIndex = 0;
    for (let th of ths) {
        let text = await th.getText();
        if (text.trim().length > 0) {
            thMapping[text.trim().replace('\n', ' ')] = thIndex;
        }
        thIndex++;
    }
    trs.shift();
    for (let tr of trs) {
        let answerListItem = {};
        let tds = await tr.findElements(By.xpath('td'));
        for (let key in thMapping) {
            let index = thMapping[key];
            let text = await tds[index].getText();
            answerListItem[key] = text.trim();
        }
        answerListArray.push(answerListItem);
    }

    cb(answerListObj);
};