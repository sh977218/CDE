const By = require('selenium-webdriver').By;

exports.parseArticleTable = async (driver, loincId, element, cb) => {
    let trs = await element.findElements(By.xpath('tbody/tr'));

    trs.shift();
    let articles = [];
    let finishedOneArticle = true;
    let i = 0;
    let oneArticle = [];
    for (let tr of trs) {
        let classes = await tr.getAttribute('class');
        if (classes.indexOf('half_space') !== -1) {
            if (oneArticle.length === 2) {
                let d = {};
                let descriptionText = await oneArticle[0].getText();
                d.Description = descriptionText.trim();

                let sourceText = await oneArticle[1].getText();
                d.Source = sourceText.trim();

                articles.push(d);
                oneArticle = [];
                finishedOneArticle = true;
                i++;
            }
        } else {
            oneArticle.push(tr);
            finishedOneArticle = false;
            i++;
        }
    }
    cb(articles);
};