import { readFileSync } from 'fs';
import { expect } from '@playwright/test';
import { test } from '../../fixtures/base-fixtures';
import { Accounts } from '../../data/user';
import { MaterialPo } from '../../pages/shared/material.po';

test.describe(`CDE view export`, async () => {
    test.beforeEach(async ({ page }) => {
        await page.route(`server/de/searchExport`, async route => {
            await page.waitForTimeout(5000);
            await route.continue();
        });
    });
    test.describe(`json export`, async () => {
        test(`as file`, async ({ page, materialPage, navigationMenu }) => {
            const cdeName = `Spinal column injury number`;
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoCdeByName(cdeName);
            await page.locator('#export').click();
            const downloadPromise = page.waitForEvent('download');
            await materialPage.matMenuItem('NIH/CDE Schema JSON file').click();
            await materialPage.checkAlert(`Export downloaded.`);
            const download = await downloadPromise;
            await download.saveAs(download.suggestedFilename());
            const downloadedFile = await download.path();
            if (downloadedFile) {
                const expectedContents = [
                    `"designations":[{"sources":[],"tags":["Health"],"designation":"Spinal column injury number"`,
                    `"definitions":[{"sources":[],"definition":"Number assigned to the spinal column injury. The spinal column injuries are assigned numbers starting with the most cephalic spinal column injury.","tags":["Health"]`,
                    `"partOfBundles":["Qy8A7JBBYg"]`,
                ];

                const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
                for (const expectedContent of expectedContents) {
                    expect(fileContent).toContain(expectedContent);
                }
            }
        });

        test(`as new tab`, async ({ page, materialPage, navigationMenu, searchPreferencesPage }) => {
            const cdeName = `Spinal column injury number`;
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoCdeByName(cdeName);
            await navigationMenu.searchPreferencesButton().click();
            await searchPreferencesPage.downloadAsTab().click();
            await searchPreferencesPage.saveButton().click();
            await materialPage.checkAlert(`Settings saved!`);

            await navigationMenu.gotoCdeByName(cdeName);
            await page.locator('#export').click();
            const [newPage] = await Promise.all([
                page.context().waitForEvent('page'),
                materialPage.matMenuItem('NIH/CDE Schema JSON preview').click(),
            ]);
            const expectedContents = [
                `"designations":[{"sources":[],"tags":["Health"],"designation":"Spinal column injury number"`,
                `"definitions":[{"sources":[],"definition":"Number assigned to the spinal column injury. The spinal column injuries are assigned numbers starting with the most cephalic spinal column injury.","tags":["Health"]`,
                `"partOfBundles":["Qy8A7JBBYg"]`,
            ];
            for (const expectedContent of expectedContents) {
                await expect(newPage.getByText(expectedContent)).toBeVisible();
            }
        });

        test(`previous version`, async ({ page, navigationMenu, historySection }) => {
            const cdeName = `ExportLatest`;
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoCdeByName(cdeName);
            const [, newPage] = await Promise.all([
                historySection.historyTableRows().nth(1).getByRole('link').click(),
                page.waitForEvent('popup'),
            ]);
            await newPage.locator('#export').click();
            const downloadPromise = newPage.waitForEvent('download');
            await newPage.getByRole('menuitem', { name: ' NIH/CDE Schema JSON file ' }).click();
            await new MaterialPo(newPage).checkAlert(`Export downloaded.`);
            const download = await downloadPromise;
            await download.saveAs(download.suggestedFilename());
            const downloadedFile = await download.path();
            if (downloadedFile) {
                const expectedContents = ['This name will be removed', '"designation":"This name will be removed"'];

                const fileContent = readFileSync(downloadedFile, { encoding: 'utf8' });
                for (const expectedContent of expectedContents) {
                    expect(fileContent).toContain(expectedContent);
                }
            }
        });

        test(`original source`, async ({ page, navigationMenu, submissionInformationSection }) => {
            const cdeName = `Feeling bad about yourself - or that you are a failure or have let yourself or your family down in last 2 weeks`;
            await navigationMenu.login(Accounts.nlm);
            await navigationMenu.gotoCdeByName(cdeName);
            const [, newPage] = await Promise.all([
                submissionInformationSection
                    .sourceContainer()
                    .filter({ hasText: 'NINDS' })
                    .getByRole('link', { name: 'Raw Artifact ' })
                    .click(),
                page.waitForEvent('popup'),
            ]);
            const expectedContents = ['Several days'];

            for (const expectedContent of expectedContents) {
                await expect(newPage.getByText(expectedContent)).not.toHaveCount(0);
            }
        });
    });
});
