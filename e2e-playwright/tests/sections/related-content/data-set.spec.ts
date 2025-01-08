import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test.describe(`Data set`, async () => {
    test(`CDE page`, async ({ page, relatedContentSection, navigationMenu }) => {
        const cdeName = 'Immunology Gonorrhea Assay Laboratory Finding Result';
        await navigationMenu.login(Accounts.testEditor);
        await navigationMenu.gotoCdeByName(cdeName);

        await relatedContentSection.dataSetTab().click();

        await expect(relatedContentSection.dataSetTable().locator('tbody tr td:nth-child(3)')).toHaveText([
            'phv00000369.v1.p1',
            'phv00000964.v1.p9',
            'phv00002984.v1.p9',
        ]);
    });
});
