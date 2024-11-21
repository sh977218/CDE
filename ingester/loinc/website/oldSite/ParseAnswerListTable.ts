import {By} from 'selenium-webdriver';

export async function parseAnswerListTable(driver, loincId, table) {
    let answerListObj: any = {
        answerListId: {},
        answerList: []
    };
    let answerListIdObj = answerListObj.answerListId;
    let answerListArray = answerListObj.answerList;

    let trs = await table.findElements(By.xpath('tbody/tr'));
    let a = await trs[0].findElement(By.css('a'));
    let urlText = await a.getAttribute('href');
    answerListIdObj.URL = urlText.trim();
    let idText = await a.getText();
    answerListIdObj.ID = idText.trim();
    trs.shift();

    let externalDefinedTables = await trs[0].findElements(By.css('table'));
    if (externalDefinedTables && externalDefinedTables.length > 0) {
        let innerTrs = await externalDefinedTables[0].findElements(By.xpath('tbody/tr'));
        for (let innerTr of innerTrs) {
            let tds = await innerTr.findElements(By.xpath('td'));
            let keyText = await tds[0].getText();
            let key = keyText.replace(/:/g, '').trim();
            let valueText = await tds[1].getText();
            answerListObj[key] = valueText.trim();
        }
        trs.shift();
    }

    if (trs.length > 0) {
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
                let fullText = await tds[index].getText();
                let brs = await tds[index].findElements(By.xpath('br'));
                if (brs.length > 0) {
                    let index = fullText.indexOf('\n');
                    answerListItem[key] = fullText.substring(0, index).trim();
                } else answerListItem[key] = fullText.trim();

            }
            answerListArray.push(answerListItem);
        }
    }
    return answerListObj;
}