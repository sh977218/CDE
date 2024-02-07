import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { expect } from '@playwright/test';

test(`Edit user avatar`, async ({ page, materialPage, inlineEdit, navigationMenu, settingMenu, usersPage }) => {
    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.nlm);
    });

    await test.step(`Verify user has no avatar`, async () => {
        await navigationMenu.gotoSettings();
        await settingMenu.usersMenu().click();
        await materialPage.usernameAutocompleteInput().fill('nlm');
        await materialPage.matOptionByText('nlm').click();
        await usersPage.searchUserButton().click();
        await expect(usersPage.searchResultByUsername('nlm').locator(usersPage.avatar()).locator('img')).toBeHidden();
    });

    await test.step(`Add avatar`, async () => {
        await page.route(`/server/user/updateUserAvatar`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        const avatarContainer = usersPage.searchResultByUsername('nlm').locator(usersPage.avatar());
        await inlineEdit.editIcon(avatarContainer).click();
        await inlineEdit.inputField(avatarContainer).fill(`/assets/img/endorsedRibbonIcon.png`);
        await inlineEdit.confirmButton(avatarContainer).click();
        await materialPage.matSpinnerShowAndGone();
    });

    await test.step(`Verify user has no avatar`, async () => {
        await expect(usersPage.searchResultByUsername('nlm').locator(usersPage.avatar()).locator('img')).toBeVisible();
    });
});
