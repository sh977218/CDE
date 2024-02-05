import { test } from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Accounts } from '../../../data/user';

test(`Admin user`, async ({ navigationMenu, settingMenu, profilePage }) => {
    await navigationMenu.login(Accounts.nlmAdminUser);
    await navigationMenu.gotoSettings();
    await settingMenu.profileMenu().click();
    await expect(profilePage.editorForLabel()).toBeHidden();
    await expect(profilePage.editorFor()).toBeHidden();
    await expect(profilePage.curatorForLabel()).toBeVisible();
    await expect(profilePage.curatorFor()).toBeVisible();
    await expect(profilePage.adminForLabel()).toBeVisible();
    await expect(profilePage.adminFor()).toHaveText('NLM');
});
