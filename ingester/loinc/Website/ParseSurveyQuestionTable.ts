const By = require('selenium-webdriver').By;
const utility = require('../Utility/utility');

exports.parseSurveyQuestionTable = async (driver, loincId, table, cb) => {
    let surveyQuestion = {};
    let trs = await table.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));
        let keyText = await tds[1].getText();

        let valueText = await tds[2].getText();
        surveyQuestion[utility.sanitizeText(keyText.trim())] = valueText.trim();
    }
    cb(surveyQuestion);
};