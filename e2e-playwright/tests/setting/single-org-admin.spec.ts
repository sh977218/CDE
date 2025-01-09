import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test(`Single org admin cannot see tab`, async ({ navigationMenu, settingMenu }) => {
    await navigationMenu.login(Accounts.cabigEditor);
    await navigationMenu.gotoSettings();
    await expect(settingMenu.adminsMenu()).toBeHidden();
    await expect(settingMenu.curatorsMenu()).toBeHidden();
    await expect(settingMenu.editorsMenu()).toBeHidden();
    await expect(settingMenu.stewardTransfer()).toBeHidden();
});
