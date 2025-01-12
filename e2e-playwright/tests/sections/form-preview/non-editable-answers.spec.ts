import { expect } from '@playwright/test';
import { test } from '../../../fixtures/base-fixtures';
import { Accounts } from '../../../data/user';

test(`Non editable answer render`, async ({ page, navigationMenu, saveModal, previewSection, formDescription }) => {
    const formName = 'Non Editable Questions';

    await test.step(`Navigate to Form and login`, async () => {
        await navigationMenu.gotoFormByName(formName);
        await navigationMenu.login(Accounts.nlm);
        await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible();
        await page.getByRole('heading', { name: 'Preview' }).scrollIntoViewIfNeeded();
    });

    await test.step(`verify non editable render view`, async () => {
        for (const input of await previewSection.previewDiv().locator('input').all()) {
            await expect(input).toBeDisabled();
        }
        for (const radio of await previewSection.previewDiv().getByRole('radio').all()) {
            await expect(radio).toBeDisabled();
        }
    });
});
