import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Bundle`, async () => {
    test(`CDE`, async ({ navigationMenu, cdePage }) => {
        const cdeName1 = 'Unexpected adverse event indicator';
        const cdeName2 = 'Adverse Event Ongoing Event Indicator';
        const bundleInfo = 'This CDE is part of a bundle';
        await navigationMenu.gotoCdeByName(cdeName1);
        await expect(cdePage.bundleInfo()).toContainText(bundleInfo);
        await navigationMenu.gotoCdeByName(cdeName2);
        await expect(cdePage.bundleInfo()).toBeHidden();
    });

    test(`Form`, async ({ formPage, navigationMenu }) => {
        const formName1 = 'Adverse Event Tracking Log';
        const formName2 = 'DateTypeTest';
        const bundleInfo = 'This form is a bundle';
        await navigationMenu.gotoFormByName(formName1);
        await expect(formPage.bundleInfo()).toContainText(bundleInfo);
        await navigationMenu.gotoFormByName(formName2, true);
        await expect(formPage.bundleInfo()).toBeHidden();
    });
});
