import test from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';

test(`Resources`, async ({ page, homePage, navigationMenu }) => {
    await homePage.goToHome();
    await navigationMenu.gotoResources();
    expect(await page.getByText(`Training`).count()).toBeGreaterThan(0);
    expect(await page.getByText(`NIH CDE Portal`).count()).toBeGreaterThan(0);
    expect(await page.getByText(`NIH Policy Notices`).count()).toBeGreaterThan(0);
});
