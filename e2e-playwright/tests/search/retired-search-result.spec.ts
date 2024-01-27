import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`Search result with retired`, async () => {
    test(`Cde search result`, async ({ page, searchPage, navigationMenu, searchPreferencesPage }) => {
        await navigationMenu.gotoCdeSearch();
        await navigationMenu.login(Accounts.orgAuthority);
        await navigationMenu.searchPreferencesButton().click();
        await searchPreferencesPage.searchPreferencesCheckbox().check();
        await searchPreferencesPage.saveButton().click();
        await searchPage.registrationStatusFilter('Retired').check();
        await expect(page.getByText('results. Sorted by relevance.')).toBeVisible();
    });
    test(`Form search result`, async ({ page, searchPage, navigationMenu, searchPreferencesPage }) => {
        await navigationMenu.gotoFormSearch();
        await navigationMenu.login(Accounts.orgAuthority);
        await navigationMenu.searchPreferencesButton().click();
        await searchPreferencesPage.searchPreferencesCheckbox().check();
        await searchPreferencesPage.saveButton().click();
        await searchPage.registrationStatusFilter('Retired').check();
        await expect(page.getByText('results. Sorted by relevance.')).toBeVisible();
    });
});
