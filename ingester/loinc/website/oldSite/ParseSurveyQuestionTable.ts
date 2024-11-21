import {By} from 'selenium-webdriver';
import {sanitizeText} from 'ingester/shared/utility';

export async function parseSurveyQuestionTable(driver, loincId, table) {
    let surveyQuestion = {};
    let trs = await table.findElements(By.xpath('tbody/tr'));
    trs.shift();
    for (let tr of trs) {
        let tds = await tr.findElements(By.xpath('td'));
        let keyText = await tds[1].getText();

        let valueText = await tds[2].getText();
        surveyQuestion[sanitizeText(keyText.trim())] = valueText.trim();
    }
    return surveyQuestion;
}