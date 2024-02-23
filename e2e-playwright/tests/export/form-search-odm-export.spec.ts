import { statSync } from 'fs';
import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test(`Search Form ODM export`, async ({ page, materialPage, navigationMenu, searchPage }) => {
    await navigationMenu.login(Accounts.nlm);
    await navigationMenu.gotoFormSearch();
    await page.route(`server/form/searchExport`, async route => {
        await page.waitForTimeout(5000);
        await route.continue();
    });
    await searchPage.browseOrganization('NIDA');
    await page.locator('#export').click();
    const downloadPromise = page.waitForEvent('download');
    await materialPage.matMenuItem('ODM archive').click();
    await materialPage.checkAlert(`Search results downloaded as ODM XML.`);
    const download = await downloadPromise;
    await download.saveAs(download.suggestedFilename());
    const downloadedFile = await download.path();
    if (downloadedFile) {
        const fileContent = statSync(downloadedFile);
        expect(fileContent.size).toBe(9086);
    }
});
