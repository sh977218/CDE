import {By} from 'selenium-webdriver';

export async function parseArticleTable(driver, loincId, element) {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    let articles = [];
    let article = "";
    for (let tr of trs) {
        let classes = await tr.getAttribute('class');
        if (classes.indexOf('half_space') === -1) {
            let text = await tr.getText();
            article = article + text;
        } else {
            articles.push(article);
            article = "";
        }
    }
    return articles;
}