import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

const newStatement = 'Never ever share this form ' + new Date();
const newAuthority = 'Patent for truth ' + new Date();
const newUrl = 'https://search.nih.gov/search?commit=Search&query=' + new Date();

test.describe(`Edit Copyright`, async () => {
    test(`Form page`, async ({ formPage, navigationMenu, inlineEdit, saveModal }) => {
        const formName = 'Quantitative Sensory Testing (QST)';
        await navigationMenu.gotoFormByName(formName);
        await navigationMenu.login(Accounts.nlm);

        await formPage.copyrightCheckbox().check();

        const copyrightStatementLocator = formPage.copyrightStatement();
        await inlineEdit.editIcon(copyrightStatementLocator).click();
        await inlineEdit.inputField(copyrightStatementLocator).fill(newStatement);
        await inlineEdit.confirmButton(copyrightStatementLocator).click();

        const copyrightAuthorityLocator = formPage.copyrightAuthority();
        await inlineEdit.editIcon(copyrightAuthorityLocator).click();
        await inlineEdit.inputField(copyrightAuthorityLocator).fill(newAuthority);
        await inlineEdit.confirmButton(copyrightAuthorityLocator).click();

        await formPage.copyrightUrlAdd().click();
        const copyrightUrlLocator = formPage.copyrightUrl().first();
        await inlineEdit.editIcon(copyrightUrlLocator).click();
        await inlineEdit.inputField(copyrightUrlLocator).fill(newUrl);
        await inlineEdit.confirmButton(copyrightUrlLocator).click();

        await saveModal.newVersion('Form saved.');
    });
});
