import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test(`Form with no CDE`, async ({ page, navigationMenu, previewSection }) => {
    const formName = 'Form with no CDE';
    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
    });

    await test.step(`Verify empty cde message`, async () => {
        await expect(previewSection.formEmptyCdeMessage()).toHaveText(
            'This form is empty. Form Editors can add content to this form by navigating to "Form Description" on the left side of the screen.'
        );
    });
});
