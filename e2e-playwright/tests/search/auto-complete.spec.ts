import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`Auto complete`, async () => {
    test.describe(`Cde search`, async () => {
        const searchTerm = 'specimen lat*';
        test.beforeEach(async ({ navigationMenu }) => {
            await navigationMenu.gotoCdeSearch();
        });

        test(`Not Logged in user can only see 'Standard' and 'Qualified'`, async ({
            materialPage,
            cdePage,
            searchPage,
        }) => {
            const cdeName = 'Cell Specimen Requirement Pathology Finding Status Specimen Histopathological Text Type';
            await searchPage.searchQueryInput().fill(searchTerm);
            for (let i = 1; i <= (await materialPage.searchAutoCompleteOptions().count()); i++) {
                await expect(materialPage.searchAutoCompleteOptions().nth(i)).not.toContainText('Specimen Laterality');
            }
            await materialPage.searchAutoCompleteOptions().filter({ hasText: cdeName }).click();
            await expect(cdePage.cdeTitle()).toContainText(cdeName);
        });

        test(`Logged in user can see all status`, async ({ materialPage, cdePage, navigationMenu, searchPage }) => {
            const cdeName = 'Specimen Laterality Not Specified Reason';
            await navigationMenu.login(Accounts.nlm);
            await searchPage.searchQueryInput().fill(searchTerm);
            await materialPage.searchAutoCompleteOptions().filter({ hasText: cdeName }).click();
            await expect(cdePage.cdeTitle()).toContainText(cdeName);
        });
    });

    test.describe(`Form search`, async () => {
        const searchTerm = 'multi';
        test.beforeEach(async ({ navigationMenu }) => {
            await navigationMenu.gotoFormSearch();
        });

        test(`Not Logged in user can only see 'Standard' and 'Qualified'`, async ({
            materialPage,
            formPage,
            searchPage,
        }) => {
            const formName = 'Multiple Sclerosis Quality of Life (MSQOL)-54';
            await searchPage.searchQueryInput().fill(searchTerm);
            for (let i = 1; i <= (await materialPage.searchAutoCompleteOptions().count()); i++) {
                await expect(materialPage.searchAutoCompleteOptions().nth(i)).not.toContainText('MultiSelect');
            }
            await materialPage.searchAutoCompleteOptions().filter({ hasText: formName }).click();
            await expect(formPage.formTitle()).toContainText(formName);
        });

        test(`Logged in user can see all status`, async ({ materialPage, formPage, navigationMenu, searchPage }) => {
            const formName = 'MultiSelect Logic';
            await navigationMenu.login(Accounts.nlm);
            await searchPage.searchQueryInput().fill(searchTerm);
            await materialPage.searchAutoCompleteOptions().filter({ hasText: formName }).click();
            await expect(formPage.formTitle()).toContainText(formName);
        });
    });
});
