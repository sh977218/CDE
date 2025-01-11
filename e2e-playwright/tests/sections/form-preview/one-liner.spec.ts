import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test(`One liner`, async ({ page, navigationMenu, previewSection }) => {
    const formName = 'SDC Adrenal';
    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.gotoFormByName(formName, true);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
    });

    await test.step(`Verify radio and input in one line`, async () => {
        const radioButton = await previewSection
            .previewDiv()
            .locator(`//label[contains(.,'Not specified')]`)
            .boundingBox();
        const input = await previewSection
            .previewDiv()
            .locator(`//label[contains(.,'Not specified')]/following-sibling::div//input`)
            .boundingBox();
        if (radioButton && input) {
            expect(radioButton.y - input.y).toBeLessThan(8);
        }
    });

    await test.step(`Verify printable`, async () => {
        const printablePage = await previewSection.printableView();
        await expect(
            printablePage.getByText('Does your health now limit you in climbing one flight of stairs?')
        ).not.toHaveCount(0);
    });
});
