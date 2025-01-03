import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';
import { Version } from '../../../model/type';

test(`Import permissible value from VSAC`, async ({
    page,
    saveModal,
    navigationMenu,
    materialPage,
    permissibleValueSection,
    historySection,
}) => {
    const cdeName = 'Patient Race Category';
    const versionInfo: Version = {
        newVersion: '3',
        changeNote: '[cde add vsac PVs]',
    };
    await test.step(`Navigate to CDE and login`, async () => {
        await navigationMenu.login(Accounts.ctepEditor);
        await navigationMenu.gotoCdeByName(cdeName);
        await expect(page.getByRole('heading', { name: 'Permissible Value' })).toBeVisible();
        await page.getByRole('heading', { name: 'Permissible Value' }).scrollIntoViewIfNeeded();
    });

    await test.step(`Remove existing PVs`, async () => {
        await page.getByRole('button', { name: 'Remove All Values' }).click();
    });

    await test.step(`Import PV from VSAC`, async () => {
        await permissibleValueSection.updateOid('2.16.840.1.114222.4.11.837');
        await page.getByRole('button', { name: 'Import Missing Values' }).click();
    });

    await test.step(`Publish new version`, async () => {
        await saveModal.publishNewVersionByType('cde', versionInfo);
    });

    await test.step(`Verify history`, async () => {
        await page.getByRole('heading', { name: 'History' }).scrollIntoViewIfNeeded();

        await test.step(`Verify compare`, async () => {
            await historySection.selectHistoryTableRowsToCompare(0, 1);
            await expect(
                materialPage.matDialog().getByText(`Code Name:American Indian or Alaska Native`)
            ).toBeVisible();
        });
    });
});
