import { test } from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Accounts } from '../../../data/user';

test(`Curator user`, async ({ page, navigationMenu, settingMenu, profilePage, curatorsPage }) => {
    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.nlm);
    });

    await test.step(`Add user to curator`, async () => {
        await navigationMenu.gotoSettings();
        await page.route(`/server/orgManagement/addOrgCurator`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await settingMenu.curatorsMenu().click();
        await curatorsPage.addOrgCuratorByUsername(Accounts.nlmCurator.username, ['NLM', 'TEST']);

        await page.route(`/server/orgManagement/removeOrgCurator`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await curatorsPage.removeOrgCuratorByUsername(Accounts.nlmCurator.username, ['TEST']);
    });

    await test.step(`Verify 'nlmCurator' is curator for 'NLM'`, async () => {
        await navigationMenu.logout();
        await navigationMenu.login(Accounts.nlmCuratorUser);
        await navigationMenu.gotoSettings();
        await settingMenu.profileMenu().click();
        await expect(profilePage.editorForLabel()).toBeHidden();
        await expect(profilePage.editorFor()).toBeHidden();
        await expect(profilePage.curatorForLabel()).toBeVisible();
        await expect(profilePage.curatorFor()).toHaveText('NLM');
        await expect(profilePage.adminForLabel()).toBeVisible();
        await expect(profilePage.adminFor()).toBeVisible();
    });
});
