import test from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';

test(`Guide`, async ({ page, homePage, navigationMenu }) => {
    await homePage.goToHome();
    await navigationMenu.gotoNewFeatures();
    await expect(page.getByText(`What's New Page Works`)).toBeVisible();
});
