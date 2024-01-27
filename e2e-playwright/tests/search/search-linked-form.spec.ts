import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';

test.describe(`Search linked form`, async () => {
    test(`Retired form > 20`, async ({ materialPage, navigationMenu, searchPage }) => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.searchQueryInput().fill(`linkedForms.Retired:>20`);
        await materialPage.matOverlay().waitFor();
        await expect(materialPage.searchAutoCompleteOptions().nth(6)).toBeVisible();
    });

    test(`Qualified form > 2`, async ({ materialPage, navigationMenu, searchPage }) => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.searchQueryInput().fill(`linkedForms.Qualified:>2`);
        await materialPage.matOverlay().waitFor();
        await expect(materialPage.searchAutoCompleteOptions().nth(9)).toBeVisible();
    });

    test(`Qualified form > 68`, async ({ materialPage, navigationMenu, searchPage }) => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.searchQueryInput().fill(`linkedForms.Qualified:>68`);
        await materialPage.matOverlay().waitFor();
        await expect(materialPage.searchAutoCompleteOptions().nth(1)).toBeVisible();
    });

    test(`Standard form > 68`, async ({ materialPage, navigationMenu, searchPage }) => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.searchQueryInput().fill(`linkedForms.Standard:>68`);
        await materialPage.matOverlay().waitFor();
        await expect(materialPage.searchAutoCompleteOptions().nth(1)).toBeVisible();
    });

    test(`Standard form = 60`, async ({ materialPage, navigationMenu, searchPage }) => {
        await navigationMenu.gotoCdeSearch();
        await searchPage.searchQueryInput().fill(`linkedForms.Standard:>20`);
        await materialPage.matOverlay().waitFor();
        await expect(materialPage.searchAutoCompleteOptions().nth(6)).toBeVisible();
    });
});
