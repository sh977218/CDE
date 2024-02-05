import { test } from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Accounts } from '../../../data/user';

test(`Curator user`, async ({ navigationMenu, settingMenu, profilePage }) => {
    await navigationMenu.login(Accounts.nlmCuratorUser);
    await navigationMenu.gotoSettings();
    await navigationMenu.gotoSettings();
    await settingMenu.profileMenu().click();
    await expect(profilePage.editorForLabel()).toBeHidden();
    await expect(profilePage.editorFor()).toBeHidden();
    await expect(profilePage.curatorForLabel()).toBeVisible();
    await expect(profilePage.curatorFor()).toHaveText('NLM');
    await expect(profilePage.adminForLabel()).toBeVisible();
    await expect(profilePage.adminFor()).toBeVisible();
});
