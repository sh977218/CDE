import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { expect } from '@playwright/test';

test(`Update user role`, async ({ page, materialPage, inlineEdit, navigationMenu, settingMenu, usersPage }) => {
    const username = `emptyRoleUser`;
    const userRole = `BoardPublisher`;
    await test.step(`Login and go to user page`, async () => {
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoSettings();
        await settingMenu.usersMenu().click();
    });

    await test.step(`Create user`, async () => {
        await usersPage.createUserByUsername(username);
    });

    await test.step(`Add role to newly created user`, async () => {
        await page.route(`/server/user/searchUsers/*`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await materialPage.usernameAutocompleteInput().fill(username);
        await materialPage.matOptionByText(username.toLowerCase()).click();
        await usersPage.searchUserButton().click();
        await materialPage.matSpinnerShowAndGone();
        const userContainer = usersPage.searchResultByUsername(username);
        await usersPage.addRolesToUser(userContainer, [userRole]);

        await test.step(`Verify user has no avatar`, async () => {
            await usersPage.searchUserButton().click();
            await materialPage.matSpinnerShowAndGone();
            await expect(userContainer.locator(usersPage.roles())).toContainText(userRole);
        });
    });
});
