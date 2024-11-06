import { expect } from '@playwright/test';
import { test } from '../fixtures/base-fixtures';
import { Accounts } from '../../e2e-playwright/data/user';

test(`Home page edit`, async ({ page, navigationMenu }) => {
    await navigationMenu.login(Accounts.nlm);
    await page.locator("//mat-icon[normalize-space()='edit']").click();
    await expect(page.getByRole('button', { name: 'Save for Later' })).toBeVisible();
    await page.getByRole('button', { name: 'Add Update' }).click();
    await page.getByLabel('Title:').first().fill('Update here');
    await page.getByRole('button', { name: 'Add Button' }).first().click();
    await page.getByLabel('Title:').nth(1).fill('Click for more');
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.locator("//*[contains(@class,'updatesBox')]")).toContainText('Update here');
    await expect(page.locator("//*[contains(@class,'updatesBox')]")).toContainText('Click for more');
});
