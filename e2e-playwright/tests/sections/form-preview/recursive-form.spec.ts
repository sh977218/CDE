import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test.describe.configure({ retries: 0 });
test(`Recursive form`, async ({ page, navigationMenu, formPage, previewSection }) => {
    const formName = 'Recursive Form';

    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.gotoFormByName(formName, true);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
    });

    await test.step(`Verify recursive warning message`, async () => {
        await expect(formPage.alerts()).toContainText('The following errors need to be corrected in order to Publish:');
    });
    await test.step(`Verify only one recursive form is shown`, async () => {
        await expect(previewSection.sectionLabel()).toHaveCount(1);
    });
});
