import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

const statement = 'Never ever share this form ' + new Date();
const authority = 'Patent for truth ' + new Date();
const url = 'https://search.nih.gov/search?commit=Search&query=' + new Date();

test.describe.configure({ retries: 0 });
test(`Edit Form Copyright`, async ({ navigationMenu, searchPage, generateDetailsSection, saveModal }) => {
    const formName = 'Quantitative Sensory Testing (QST)';

    await test.step(`Form is in 'Public domain, free to use'`, async () => {
        await navigationMenu.gotoFormSearch();
        await searchPage.searchQueryInput().fill(`"${formName}"`);
        await searchPage.searchSubmitButton().click();
        await expect(searchPage.copyrightStatusFilter('Public domain, free to use').first()).toBeVisible();
        await expect(searchPage.copyrightStatusFilter('Copyrighted, but free to use').first()).toBeHidden();
        await expect(searchPage.copyrightStatusFilter('Copyrighted, with restrictions').first()).toBeHidden();
    });

    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.nlm);
    });

    await test.step(`Go to form and edit copyright`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await generateDetailsSection.editCopyright({
            copyright: true,
            statement,
            authority,
            url,
        });

        await test.step(`Publish form`, async () => {
            await saveModal.newVersion('Form saved.');
        });

        await test.step(`Form is in 'Copyrighted, but free to use'`, async () => {
            await navigationMenu.gotoFormSearch();
            await searchPage.searchQueryInput().fill(`"${formName}"`);
            await searchPage.searchSubmitButton().click();
            await expect(searchPage.copyrightStatusFilter('Public domain, free to use').first()).toBeHidden();
            await expect(searchPage.copyrightStatusFilter('Copyrighted, but free to use').first()).toBeVisible();
            await expect(searchPage.copyrightStatusFilter('Copyrighted, with restrictions').first()).toBeHidden();
        });
    });

    await test.step(`Go to form and edit noRenderAllow`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await generateDetailsSection.disallowRenderingCheckbox().check();

        await test.step(`Publish form`, async () => {
            await saveModal.newVersion('Form saved.');
        });

        await test.step(`Form is in 'Copyrighted, with restrictions'`, async () => {
            await navigationMenu.gotoFormSearch();
            await searchPage.searchQueryInput().fill(`"${formName}"`);
            await searchPage.searchSubmitButton().click();
            await expect(searchPage.copyrightStatusFilter('Public domain, free to use').first()).toBeHidden();
            await expect(searchPage.copyrightStatusFilter('Copyrighted, but free to use').first()).toBeHidden();
            await expect(searchPage.copyrightStatusFilter('Copyrighted, with restrictions').first()).toBeVisible();
        });
    });
});
