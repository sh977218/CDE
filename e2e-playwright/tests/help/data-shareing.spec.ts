import { test } from '../../fixtures/base-fixtures';
import { expect } from '@playwright/test';

test(`NIH Data Sharing`, async ({ page, navigationMenu }) => {
    await navigationMenu.gotoNihDataSharing();
    await expect(page.getByText(`NIH Data Sharing Page Works`)).toBeVisible();
});
