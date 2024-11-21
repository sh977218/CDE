import {By} from 'selenium-webdriver';

export async function parseWebContentTable(driver, loincId, element) {
    let trs = await element.findElements(By.xpath('tbody/tr'));
    trs.shift();
    let webContents = [];
    let webContent = "";
    for (let tr of trs) {
        let classes = await tr.getAttribute('class');
        if (classes.indexOf('half_space') === -1) {
            let text = await tr.getText();
            webContent = webContent + text;
        } else {
            webContents.push(webContent);
            webContent = "";
        }
    }
    return webContents;
}