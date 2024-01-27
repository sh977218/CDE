import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`search preferences`, async () => {
    test.describe(`Should not see`, async () => {
        test(`Logout user`, async () => {});

        test(`Regular user`, async ({ navigationMenu }) => {
            await navigationMenu.login(Accounts.regularUser);
        });

        test.afterEach(async ({ navigationMenu }) => {
            await expect(navigationMenu.searchPreferencesButton()).toBeHidden();
        });
    });

    test.describe(`Should see`, async () => {
        test(`Site admin`, async ({ navigationMenu }) => {
            await navigationMenu.login(Accounts.nlm);
        });
        test(`Org authority`, async ({ navigationMenu }) => {
            await navigationMenu.login(Accounts.orgAuthority);
        });

        test.afterEach(async ({ navigationMenu }) => {
            await expect(navigationMenu.searchPreferencesButton()).toBeVisible();
        });
    });
});
