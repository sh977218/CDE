import { readFileSync } from 'fs';
import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';

test.describe(`CDE view export`, async () => {
    const cdeName = `Spinal column injury number`;
    test.beforeEach(async ({ page, navigationMenu }) => {
        await page.route(`server/de/searchExport`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
        await navigationMenu.login(Accounts.nlm);
        await navigationMenu.gotoCdeByName(cdeName);
    });
    test.describe(`json export`, async () => {
        test(`as file`, async ({ page, materialPage }) => {
            await page.locator('#export').click();
            const downloadPromise = page.waitForEvent('download');
            await materialPage.matMenuItem('NIH/CDE Schema JSON file Schema').click();
            await materialPage.checkAlert(`Export downloaded.`);
            const download = await downloadPromise;
            await download.saveAs(download.suggestedFilename());
            const downloadedFile = await download.path();
            if (downloadedFile) {
                const expectedContents = [
                    `"designations":[{"tags":["Health"],"designation":"Spinal column injury number"`,
                    `"definitions":[{"definition":"Number assigned to the spinal column injury. The spinal column injuries are assigned numbers starting with the most cephalic spinal column injury.","tags":["Health"]`,
                    `"partOfBundles":["Qy8A7JBBYg"]`,
                ];

                const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
                for (const expectedContent of expectedContents) {
                    expect(fileContent).toContain(expectedContent);
                }
            }
        });

        test(`as new tab`, async ({ page, materialPage, navigationMenu, searchPreferencesPage }) => {
            await navigationMenu.searchPreferencesButton().click();
            await searchPreferencesPage.downloadAsTab().click();
            await searchPreferencesPage.saveButton().click();
            await materialPage.checkAlert(`Settings saved!`);

            await navigationMenu.gotoCdeByName(cdeName);
            await page.locator('#export').click();
            const [newPage] = await Promise.all([
                page.context().waitForEvent('page'),
                materialPage.matMenuItem('NIH/CDE Schema JSON preview Schema').click(),
            ]);
            const expectedContents = [
                `"designations":[{"tags":["Health"],"designation":"Spinal column injury number"`,
                `"definitions":[{"definition":"Number assigned to the spinal column injury. The spinal column injuries are assigned numbers starting with the most cephalic spinal column injury.","tags":["Health"]`,
                `"partOfBundles":["Qy8A7JBBYg"]`,
            ];
            for (const expectedContent of expectedContents) {
                await expect(newPage.getByText(expectedContent)).toBeVisible();
            }
        });
    });
});
