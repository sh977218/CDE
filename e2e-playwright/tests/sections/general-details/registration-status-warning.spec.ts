import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Registration status warning`, async () => {
    const cdeName1 = 'Specimen Collection Sampling Number';
    const cdeName2 = 'Adverse Event Ongoing Event Indicator';
    test(`not logged in cannot see warning`, async ({ page, cdePage, generateDetailsSection, navigationMenu }) => {
        await test.step(`none Standard or Preferred Standard CDE doesn't have warning message`, async () => {
            await navigationMenu.gotoCdeByName(cdeName1);
            await expect(page.getByText('Note: You may not edit this CDE because it is standard.')).toBeHidden();
        });
        await test.step(`Standard CDE doesn't have warning message`, async () => {
            await navigationMenu.gotoCdeByName(cdeName2);
            await expect(page.getByText('Note: You may not edit this CDE because it is standard.')).toBeHidden();
        });
    });

    test(`site admin cannot see warning`, async ({ page, cdePage, generateDetailsSection, navigationMenu }) => {
        await navigationMenu.login(Accounts.nlm);
        await test.step(`none Standard or Preferred Standard CDE doesn't have warning message`, async () => {
            await navigationMenu.gotoCdeByName(cdeName2);
            await expect(page.getByText('Note: You may not edit this CDE because it is standard.')).toBeHidden();
        });
    });
    test(`org editor see warning`, async ({ page, cdePage, generateDetailsSection, navigationMenu }) => {
        await navigationMenu.login(Accounts.cabigEditor);
        await test.step(`none Standard or Preferred Standard CDE does have warning message`, async () => {
            await navigationMenu.gotoCdeByName(cdeName2);
            await expect(page.getByText('Note: You may not edit this CDE because it is standard.')).toBeVisible();
        });
    });
});
