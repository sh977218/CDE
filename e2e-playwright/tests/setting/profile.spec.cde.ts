import test from '../../fixtures/base-fixtures';
import user from '../../data/user';
import { expect } from '@playwright/test';

test.describe(`Profile`, async () => {
    test(`Edit user email`, async ({ basePage, snackBar, inlineEdit, navigationMenu, settingMenu, profilePage }) => {
        await basePage.goToHome();
        await navigationMenu.login(user.nlm.username, user.nlm.password);
        await navigationMenu.gotoSettings();
        await settingMenu.profileMenu().click();
        const userEmailLocator = profilePage.userEmail();
        await inlineEdit.editIcon(userEmailLocator).click();
        await inlineEdit.inputField(userEmailLocator).fill('me@');
        await expect(inlineEdit.submitButton(userEmailLocator)).toBeDisabled();
        await inlineEdit.inputField(userEmailLocator).fill('me@me.com');
        await inlineEdit.submitButton(userEmailLocator).click();
        await snackBar.checkAlert('Saved');
    });
});
