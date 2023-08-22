import { expect } from '@playwright/test';
import test from '../../fixtures/base-fixtures';
import user from '../../data/user';

test.describe(`Search result with retired`, async () => {
    test(`Cde search result`, async ({cdePage}) => {
        await cdePage.goToSearch('cde');
    });
    test(`Form search result`, async ({formPage}) => {
        await formPage.goToSearch('form');
    });

    test.afterEach(async ({page, searchPage, navigationMenu, searchPreferencesPage}) => {
        await navigationMenu.login(user.orgAuthority.username, user.orgAuthority.password);
        await navigationMenu.searchPreferencesButton().click();
        await searchPreferencesPage.searchPreferencesCheckbox().check();
        await searchPreferencesPage.saveButton().click();
        await searchPage.registrationStatusFilter('Retired').check();
        await expect(page.getByText('results. Sorted by relevance.')).toBeVisible();
    })
});
