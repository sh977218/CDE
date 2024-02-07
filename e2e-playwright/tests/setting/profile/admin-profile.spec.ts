import { test } from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Accounts } from '../../../data/user';

test(`Admin user`, async ({ page, navigationMenu, settingMenu, profilePage, adminsPage }) => {
    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.nlm);
    });

    await test.step(`Add user to admin`, async () => {
        await navigationMenu.gotoSettings();
        await page.route(`/server/orgManagement/addOrgAdmin`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await settingMenu.adminsMenu().click();
        await adminsPage.addOrgAdminByUsername(Accounts.nlmAdminUser.username, ['NLM', 'TEST']);

        await page.route(`/server/orgManagement/removeOrgAdmin`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await adminsPage.removeOrgAdminByUsername(Accounts.nlmAdminUser.username, ['TEST']);
    });

    await test.step(`Verify 'nlmAdmin' is admin for 'NLM'`, async () => {
        await navigationMenu.logout();
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
});
