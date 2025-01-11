import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`table render`, async ({ page, navigationMenu, saveModal, previewSection, formDescription }) => {
    const formName = 'Form Table Test';

    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.gotoFormByName(formName, true);
        await navigationMenu.login(Accounts.nlm);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
    });

    await test.step(`verify table`, async () => {
        await expect(
            previewSection.previewDiv().getByRole('cell', { name: 'Patient Family Member Order' })
        ).toHaveAttribute('rowspan', '4');
        await expect(previewSection.previewDiv().getByRole('cell', { name: '1. Condition' })).toHaveAttribute(
            'colspan',
            '3'
        );
        await expect(previewSection.previewDiv().getByTitle('Education level').first().locator('label')).toHaveCount(
            23
        );
        await expect(previewSection.previewDiv().getByLabel('year')).toHaveCount(10);
        await expect(previewSection.previewDiv().getByRole('cell', { name: 'Education level' })).toHaveCount(2);
    });
});
