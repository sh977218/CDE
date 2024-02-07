import { expect } from '@playwright/test';
import { Accounts } from '../../data/user';
import { test } from '../../fixtures/base-fixtures';

test.describe.configure({ retries: 0 });
test(`Update org classification`, async ({ page, navigationMenu, manageClassificationPage, materialPage }) => {
    await test.step(`Login`, async () => {
        await navigationMenu.login(Accounts.nlm);
    });

    await page.route(`/server/classification/updateOrgClassification`, async route => {
        await page.waitForTimeout(5000);
        await route.continue();
    });

    await test.step(`Go org classification and 'TEST' doesn't have 'AIRR demo'`, async () => {
        await navigationMenu.gotoClassification();
        await materialPage.selectMatSelect(manageClassificationPage.organizationSelect(), 'TEST');
        await materialPage.expandClassificationAndReturnLeafNode(['TEST']);
        await expect(page.getByText('AIRR demo')).toBeHidden();
    });

    await test.step(`Update org classification and 'TEST' does have 'AIRR demo'`, async () => {
        await manageClassificationPage.updateOrgClassificationButton().click();
        await materialPage.matSpinnerShowAndGone();
        await materialPage.expandClassificationAndReturnLeafNode(['TEST']);
        await expect(page.getByText('AIRR demo')).toBeVisible();
    });
});
