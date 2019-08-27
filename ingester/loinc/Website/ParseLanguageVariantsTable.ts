import { By } from 'selenium-webdriver';

export async function parseLanguageVariantsTable(driver, loincId, table) {
    let languageVariants = [];
    let trs = await table.findElements(By.xpath('tbody/tr'));
    trs.shift();
    if (trs.length % 2 !== 0)
        throw new Error('Parse language variants error ' + loincId);
    let num_language_variants = trs.length / 2;
    for (let i = 0; i < num_language_variants; i++) {
        let titleTr = trs[i];
        let contentTr = trs[i + 1];
        let title = await titleTr.getText();
        let content = await contentTr.getText();
        let languageVariant = {title: title.trim(), content: content.trim()};
        languageVariants.push(languageVariant);
    }
    return languageVariants;
}