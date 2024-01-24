import test from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';

test(`Guide`, async ({ page, homePage, navigationMenu }) => {
    await homePage.goToHome();
    await navigationMenu.gotoGuide();
    await expect(page.getByText(`Guide to the NIH CDE Repository`)).toBeVisible();
});
