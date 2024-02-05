import { test } from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Accounts } from '../../../data/user';

test(`Editor user`, async ({ navigationMenu, settingMenu, profilePage }) => {
    await navigationMenu.login(Accounts.nlmEditorUser);
    await navigationMenu.gotoSettings();
    await settingMenu.profileMenu().click();
    await expect(profilePage.editorForLabel()).toBeVisible();
    await expect(profilePage.editorFor()).toHaveText('NLM');
    await expect(profilePage.curatorForLabel()).toBeVisible();
    await expect(profilePage.curatorFor()).toHaveText('NLM');
    await expect(profilePage.adminForLabel()).toBeVisible();
    await expect(profilePage.adminFor()).toBeVisible();
});
