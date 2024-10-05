import { test } from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';

test(`New Feature`, async ({ page, navigationMenu }) => {
    await navigationMenu.gotoNewFeatures();
    await expect(page.getByText(`What's New Page Works`)).toBeVisible();
});
