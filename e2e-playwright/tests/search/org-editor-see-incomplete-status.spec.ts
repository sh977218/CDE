import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test(`Org editor can see 'Incomplete' status`, async ({ navigationMenu, searchPage }) => {
    await navigationMenu.gotoCdeSearch();
    await navigationMenu.login(Accounts.testEditor);
    await expect(searchPage.registrationStatusFilter('Incomplete')).toBeVisible();
});
