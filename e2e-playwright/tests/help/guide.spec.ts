import { test } from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';

test(`Guide`, async ({ page, navigationMenu }) => {
    await navigationMenu.gotoGuide();
    await expect(page.getByText(`Guide to the NIH CDE Repository`)).toBeVisible();
});
