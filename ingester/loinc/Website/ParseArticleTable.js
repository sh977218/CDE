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

                let descriptionLink = await oneArticle[0].findElements(By.css('a'));
                if (descriptionLink.length !== 1)
                    throw new Error('Parse article error ' + loincId);
                let descriptionLinkHref = descriptionLink[0].getAttribute('href');
                d.DescriptionLink = descriptionLinkHref.trim();

                let sourceText = await oneArticle[1].getText();
                d.Source = sourceText.trim();

                let sourceLink = oneArticle[1].findElements(By.css('a'));
                if (sourceLink.length !== 1)
                    throw new Error('Parse article error ' + loincId);

                let sourceLinkHref = await sourceLink[0].getAttribute('href');
                d.SourceLink = sourceLinkHref.trim();

                articles.push(d);
                oneArticle = [];
                finishedOneArticle = true;
                i++;
                doneOneTr();
            } else {
                i++;
                doneOneTr();
            }
        } else {
            oneArticle.push(tr);
            finishedOneArticle = false;
            i++;
        }
    }
    cb(articles);

};