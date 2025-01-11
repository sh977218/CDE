import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';

test(`Lform render`, async ({ page, navigationMenu, previewSection, formDescription }) => {
    const formName = 'Loinc Widget Test Form';

    await test.step(`Login and navigate to form`, async () => {
        await navigationMenu.gotoFormByName(formName);
    });

    await test.step(`Verify Printable`, async () => {
        const lformPage = await previewSection.lformView();
        await expect(lformPage.getByText('PROMIS SF v1.0 - Phys. Function 10a')).not.toHaveCount(0);
        await expect(lformPage.getByText('section contains form')).not.toHaveCount(0);
        await expect(lformPage.getByText('Are you able to get on and off the toilet?')).not.toHaveCount(0);
    });
});
