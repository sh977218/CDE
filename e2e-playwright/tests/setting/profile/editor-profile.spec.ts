import { test } from '../../../fixtures/base-fixtures';
import { expect } from '@playwright/test';
import { Accounts } from '../../../data/user';

test(`Editor user`, async ({ page, navigationMenu, settingMenu, profilePage, editorsPage }) => {
    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.nlm);
    });

    await test.step(`Add user to editor`, async () => {
        await navigationMenu.gotoSettings();
        await page.route(`/server/orgManagement/addOrgEditor`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await settingMenu.editorsMenu().click();
        await editorsPage.addOrgEditorByUsername(Accounts.nlmEditorUser.username, ['NLM', 'TEST']);

        await page.route(`/server/orgManagement/removeOrgEditor`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await editorsPage.removeOrgEditorByUsername(Accounts.nlmEditorUser.username, ['TEST']);
    });

    await test.step(`Verify 'nlmCurator' is curator for 'NLM'`, async () => {
        await navigationMenu.logout();
        await navigationMenu.login(Accounts.nlmEditorUser);
        await navigationMenu.gotoSettings();
        await settingMenu.profileMenu().click();
        await expect(profilePage.editorForLabel()).toBeVisible();
        await expect(profilePage.editorFor()).toHaveText('NLM');
        await expect(profilePage.curatorForLabel()).toBeVisible();
        await expect(profilePage.curatorFor()).toHaveText('');
        await expect(profilePage.adminForLabel()).toBeVisible();
        await expect(profilePage.adminFor()).toBeVisible();
    });
});
