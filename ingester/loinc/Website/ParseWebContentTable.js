const By = require('selenium-webdriver').By;

exports.parseWebContentTable = async (element, cb) => {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    let webContents = [];
    let finishedOneWebContent = true;
    let i = 0;
    let oneWebContent = [];
    for (let tr  of trs) {
        let classes = await tr.getAttribute('class');
        if (classes.indexOf('half_space') !== -1) {
            if (oneWebContent.length === 2) {
                let d = {};
                let copyrightText = await oneWebContent[0].getText();
                d.Copyright = copyrightText.trim();

                let copyrightLink = await oneWebContent[0].findElements(By.css('a'));
                if (copyrightLink.length !== 1) throw new Error('Parse web content error');
                let copyrightLinkHref = await copyrightLink[0].getAttribute('href');
                d.CopyrightLink = copyrightLinkHref.trim();

                let sourceText = await oneWebContent[1].getText();
                d.Source = sourceText.trim();

                let sourceLink = await oneWebContent[1].findElements(By.css('a'));
                if (sourceLink.length !== 1) throw new Error('Parse web content error');

                let sourceLinkHref = await sourceLink[0].getAttribute('href');
                d.SourceLink = sourceLinkHref.trim();

                webContents.push(d);
                oneWebContent = [];
                finishedOneWebContent = true;
            }
            i++;
        } else {
            oneWebContent.push(tr);
            finishedOneWebContent = false;
            i++;
        }
    }
    cb(webContents);
};