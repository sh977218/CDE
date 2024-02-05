import { test } from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Accounts } from '../../../data/user';

test(`Edit user email`, async ({
    materialPage,

    inlineEdit,
    navigationMenu,
    settingMenu,
    profilePage,
}) => {
    await navigationMenu.login(Accounts.nlm);
    await navigationMenu.gotoSettings();
    await settingMenu.profileMenu().click();
    const userEmailLocator = profilePage.userEmail();
    await inlineEdit.editIcon(userEmailLocator).click();
    await inlineEdit.inputField(userEmailLocator).fill('me@');
    await expect(inlineEdit.confirmButton(userEmailLocator)).toBeDisabled();
    await inlineEdit.inputField(userEmailLocator).fill('me@me.com');
    await inlineEdit.confirmButton(userEmailLocator).click();
    await materialPage.checkAlert('Saved');
});
