import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`es version`, async ({ page, navigationMenu, settingMenu }) => {
    await navigationMenu.login(Accounts.nlm);
    await navigationMenu.gotoSettings();
    await settingMenu.serverStatusMenu().click();
    await expect(page.getByTestId(`es-info`)).toContainText(`"number": "7.17.`);
});
