import { expect } from '@playwright/test';
import test from '../../fixtures/base-fixtures';
import user from '../../data/user';

test.describe(`Search result with retired`, async () => {
    test(`Cde search result`, async ({ page, searchPage, navigationMenu, searchPreferencesPage }) => {
        await searchPage.goToSearch('cde');
        await navigationMenu.login(user.orgAuthority.username, user.orgAuthority.password);
        await navigationMenu.searchPreferencesButton().click();
        await searchPreferencesPage.searchPreferencesCheckbox().check();
        await searchPreferencesPage.saveButton().click();
        await searchPage.registrationStatusFilter('Retired').check();
        await expect(page.getByText('results. Sorted by relevance.')).toBeVisible();
    });
    test(`Form search result`, async ({ page, searchPage, navigationMenu, searchPreferencesPage }) => {
        await searchPage.goToSearch('form');
        await navigationMenu.login(user.orgAuthority.username, user.orgAuthority.password);
        await navigationMenu.searchPreferencesButton().click();
        await searchPreferencesPage.searchPreferencesCheckbox().check();
        await searchPreferencesPage.saveButton().click();
        await searchPage.registrationStatusFilter('Retired').check();
        await expect(page.getByText('results. Sorted by relevance.')).toBeVisible();
    });
});
