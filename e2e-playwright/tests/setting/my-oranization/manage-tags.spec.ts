import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`Manage tags`, async ({
    page,
    materialPage,
    settingMenu,
    manageTagsPropertiesPage,
    navigationMenu,
    generateDetailsSection,
}) => {
    const orgName = 'TEST';
    const tag = 'canYouSeeThis' + new Date().toISOString();
    const cdeName = 'Distance from Closest Margin Value';

    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.nlm);
    });

    await page.route(`/server/orgManagement/updateOrg`, async route => {
        await page.waitForTimeout(5000);
        await route.continue();
    });

    await test.step(`add a new tag`, async () => {
        await navigationMenu.gotoSettings();
        await settingMenu.manageTags().click();
        await expect(page.getByRole('heading', { name: 'Tags' })).toBeVisible();
        await manageTagsPropertiesPage.addTagByOrg(orgName, tag);
        await test.step(`Go to CDE and verify newly added tag available`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await generateDetailsSection.addName({ designation: 'new name', tags: [tag] });
        });
    });

    await test.step(`remove newly added tag`, async () => {
        await navigationMenu.gotoSettings();
        await settingMenu.manageTags().click();
        await expect(page.getByRole('heading', { name: 'Tags' })).toBeVisible();
        await manageTagsPropertiesPage.removeTagByOrg(orgName, tag);
        await test.step(`Go to CDE and verify newly added tag unavailable`, async () => {
            await navigationMenu.gotoCdeByName(cdeName);
            await page.getByRole('button', { name: `Add Name`, exact: true }).click();
            await materialPage.matDialog().waitFor();
            await materialPage.matChipListInput(materialPage.matDialog().locator(`[id="newDesignationTags"]`)).click();
            await expect(materialPage.matOptionByText('canYouSeeThis')).toBeHidden();
        });
    });
});
