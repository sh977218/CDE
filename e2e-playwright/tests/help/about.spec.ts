import { test } from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';

test(`About`, async ({ page, navigationMenu }) => {
    await navigationMenu.gotoAbout();
    await expect(page.getByText(`About CDE project.`)).toBeVisible();
});
